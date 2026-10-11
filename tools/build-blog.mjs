// 博客构建脚本
// 扫描 blog/posts/*.md，生成：
//   1) 每篇文章的独立静态页   blog/<slug>.html
//   2) 博客列表页的卡片       blog/index.html 中 <!-- BLOG:LIST:START --> 与 <!-- BLOG:LIST:END --> 之间
//   3) 首页「最新文章」卡片   index.html 中 <!-- BLOG:LATEST:START --> 与 <!-- BLOG:LATEST:END --> 之间
//
// 用法：
//   node tools/build-blog.mjs           跳过 frontmatter 中 draft: true 的文章
//   node tools/build-blog.mjs --drafts  连草稿一起生成（本地预览用，不要提交草稿页面）
//
// 文章用 Markdown 编写，元数据写在 frontmatter 里。新增文章只需往 blog/posts/ 丢一个 .md 文件，
// 再跑一次本脚本；文件名（不含 .md）就是 URL slug，建议只用小写英文、数字和短横线。

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = resolve(root, 'blog');
const POSTS_DIR = resolve(BLOG_DIR, 'posts');
const SITE_URL = 'https://zhiyyeah.github.io';
const SITE_NAME = '叶志远';
const INCLUDE_DRAFTS = process.argv.includes('--drafts');

// ── 分类配置：改这里就能调整分类名称、描述与排序 ──────────────────────────────
// key 用于 URL 与 CSS hook；name 是 frontmatter 里 category 的取值；order 决定筛选按钮顺序。
const CATEGORIES = [
  { key: 'research', name: '科研笔记', en: 'Research', description: '遥感、深度学习、论文阅读与科研心得。', order: 1 },
  { key: 'tech', name: '技术分享', en: 'Tech', description: 'Python、AI、开发工具、环境配置与问题解决。', order: 2 },
  { key: 'ideas', name: '奇思妙想', en: 'Ideas', description: '突发灵感、个人思考与尚未成熟的想法。', order: 3 },
  { key: 'life', name: '生活随笔', en: 'Life', description: '旅行、科考航次、日常见闻与生活感悟。', order: 4 },
];
const DEFAULT_CATEGORY = CATEGORIES[0];
const byCategoryName = new Map(CATEGORIES.map((c) => [c.name, c]));
const byCategoryKey = new Map(CATEGORIES.map((c) => [c.key, c]));

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => escapeHtml(s).replace(/"/g, '&quot;');

// ── frontmatter ──────────────────────────────────────────────────────────────
// 支持：key: value / key: "value" / key: [a, b] / 以及紧跟其后的 - item 列表
function parseFrontMatter(source, file) {
  const text = source.replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: 缺少 frontmatter（文件必须以 --- 开头）`);
  const meta = {};
  const lines = match[1].split('\n');
  let listKey = null;
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) continue;
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey) {
      meta[listKey].push(unquote(item[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) throw new Error(`${file}: 无法解析的元数据行「${line}」`);
    const key = kv[1];
    const value = kv[2].trim();
    if (!value) {
      listKey = key;
      meta[key] = [];
      continue;
    }
    listKey = null;
    if (/^\[.*\]$/.test(value)) {
      meta[key] = value
        .slice(1, -1)
        .split(',')
        .map((v) => unquote(v.trim()))
        .filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      meta[key] = value === 'true';
    } else {
      meta[key] = unquote(value);
    }
  }
  return { meta, body: match[2] };
}

function unquote(value) {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

// ── 代码高亮（够用的近似实现：注释 / 字符串 / 数字 / 关键字 / 函数名）───────────
const KEYWORDS = {
  python: 'def class return if elif else for while import from as with try except finally raise yield lambda None True False and or not in is self async await pass break continue global nonlocal assert del print',
  javascript: 'const let var function return if else for while import from export default class extends new this async await try catch finally throw typeof instanceof null undefined true false of in',
  js: 'const let var function return if else for while import from export default class extends new this async await try catch finally throw typeof instanceof null undefined true false of in',
  json: 'true false null',
  yaml: 'true false null',
  bash: 'if then else fi for do done while case esac function return export local echo cd ls cp mv rm mkdir sudo apt pip conda python node git',
  sh: 'if then else fi for do done while case esac function return export local echo cd ls cp mv rm mkdir sudo apt pip conda python node git',
  css: '',
  html: '',
  markdown: '',
  md: '',
  text: '',
};
const COMMENT_PATTERNS = {
  python: '#[^\\n]*',
  yaml: '#[^\\n]*',
  bash: '#[^\\n]*',
  sh: '#[^\\n]*',
  javascript: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/',
  js: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/',
  json: '\\/\\/[^\\n]*',
  css: '\\/\\*[\\s\\S]*?\\*\\/',
  html: '&lt;!--[\\s\\S]*?--&gt;',
};

function highlight(rawCode, lang) {
  const language = (lang || '').toLowerCase();
  const keywords = (KEYWORDS[language] || '').split(/\s+/).filter(Boolean);
  const alternatives = [];
  const comment = COMMENT_PATTERNS[language];
  if (comment) alternatives.push(`(?<comment>${comment})`);
  alternatives.push('(?<string>"(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)');
  alternatives.push('(?<number>\\b\\d+(?:\\.\\d+)?\\b)');
  if (keywords.length) {
    alternatives.push(`(?<keyword>\\b(?:${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b)`);
  }
  const pattern = new RegExp(alternatives.join('|'), 'g');
  let out = '';
  let last = 0;
  for (const m of rawCode.matchAll(pattern)) {
    out += escapeHtml(rawCode.slice(last, m.index));
    const g = m.groups || {};
    const cls = g.comment ? 'tok-comment' : g.string ? 'tok-string' : g.number ? 'tok-number' : 'tok-keyword';
    out += `<span class="${cls}">${escapeHtml(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  out += escapeHtml(rawCode.slice(last));
  return out;
}

function codeBlock(code, lang) {
  const label = lang ? `<span class="code-block__lang">${escapeHtml(lang)}</span>` : '<span></span>';
  return [
    '<div class="code-block">',
    `<div class="code-block__bar">${label}<button class="code-block__copy" type="button">复制</button></div>`,
    `<pre><code${lang ? ` class="language-${attr(lang)}"` : ''}>${highlight(code, lang)}</code></pre>`,
    '</div>',
  ].join('');
}

// ── 行内元素 ─────────────────────────────────────────────────────────────────
function renderInline(raw) {
  const codes = [];
  let text = raw.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000C${codes.length - 1}\u0000`;
  });
  text = escapeHtml(text);

  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, src, title) => {
    const t = title ? ` title="${attr(title)}"` : '';
    return `<span class="post-figure"><img src="${attr(src)}" alt="${attr(alt)}" loading="lazy" decoding="async"${t}>${
      alt ? `<span class="post-figure__caption">${alt}</span>` : ''
    }</span>`;
  });
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, label, href, title) => {
    const t = title ? ` title="${attr(title)}"` : '';
    const external = /^https?:\/\//.test(href);
    const rel = external ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${attr(href)}"${t}${rel}>${label}</a>`;
  });
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|[\s(（])__([^_]+)__(?=[\s).，。！？]|$)/g, '$1<strong>$2</strong>');
  text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  text = text.replace(/(^|[\s(（])_([^_\n]+)_(?=[\s).，。！？]|$)/g, '$1<em>$2</em>');
  text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  text = text.replace(/\$([^$\n]+)\$/g, '<span class="math-inline">$$$1$$</span>');

  text = text.replace(/\u0000C(\d+)\u0000/g, (_, i) => `<code>${escapeHtml(codes[Number(i)])}</code>`);
  return text;
}

// 段落内的软换行：中文之间不留空格，其余按空格处理
function joinParagraph(lines) {
  return lines
    .join('\n')
    .replace(/\n+/g, ' ')
    .replace(/([\u4e00-\u9fff\u3000-\u303f])\s+([\u4e00-\u9fff\u3000-\u303f])/g, '$1$2')
    .trim();
}

function headingId(text, used) {
  const base = text
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase() || 'section';
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

// ── 块级元素 ─────────────────────────────────────────────────────────────────
function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const used = new Set();
  const toc = [];
  const out = [];
  let i = 0;

  const flushParagraph = (buf) => {
    if (!buf.length) return;
    out.push(`<p>${renderInline(joinParagraph(buf))}</p>`);
    buf.length = 0;
  };
  const paragraph = [];

  while (i < lines.length) {
    const line = lines[i];

    // 空行
    if (!line.trim()) {
      flushParagraph(paragraph);
      i++;
      continue;
    }

    // 围栏代码块
    const fence = line.match(/^(```+|~~~+)\s*([\w+#.-]*)\s*$/);
    if (fence) {
      flushParagraph(paragraph);
      const marker = fence[1][0].repeat(3);
      const lang = fence[2];
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(marker)) {
        code.push(lines[i]);
        i++;
      }
      i++;
      out.push(codeBlock(code.join('\n'), lang));
      continue;
    }

    // 块级公式
    if (line.trim().startsWith('$$')) {
      flushParagraph(paragraph);
      const math = [];
      const first = line.trim().slice(2);
      if (first.endsWith('$$') && first.length > 2) {
        math.push(first.slice(0, -2));
        i++;
      } else {
        if (first) math.push(first);
        i++;
        while (i < lines.length && !lines[i].includes('$$')) {
          math.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++;
      }
      out.push(`<div class="math-block">$$${escapeHtml(math.join('\n').trim())}$$</div>`);
      continue;
    }

    // 分隔线
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushParagraph(paragraph);
      out.push('<hr>');
      i++;
      continue;
    }

    // 标题
    const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      flushParagraph(paragraph);
      const level = Math.min(heading[1].length + 1, 6); // 页面已有 h1（文章标题），正文整体下沉一级
      const text = renderInline(heading[2]);
      const id = headingId(heading[2], used);
      if (level <= 4) toc.push({ level, id, text: heading[2].replace(/[*`]/g, '') });
      out.push(`<h${level} id="${attr(id)}">${text}</h${level}>`);
      i++;
      continue;
    }

    // 引用
    if (/^\s*>/.test(line)) {
      flushParagraph(paragraph);
      const quote = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${renderMarkdown(quote.join('\n'), { used }).html}</blockquote>`);
      continue;
    }

    // 表格
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      flushParagraph(paragraph);
      const splitRow = (row) =>
        row
          .replace(/^\s*\|/, '')
          .replace(/\|\s*$/, '')
          .split('|')
          .map((c) => c.trim());
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c) => {
        if (/^:-+:$/.test(c)) return ' style="text-align:center"';
        if (/^:-+/.test(c)) return ' style="text-align:left"';
        if (/-+:$/.test(c)) return ' style="text-align:right"';
        return '';
      });
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      out.push('<div class="table-wrap"><table><thead><tr>');
      head.forEach((cell, n) => out.push(`<th${align[n] || ''}>${renderInline(cell)}</th>`));
      out.push('</tr></thead><tbody>');
      for (const row of rows) {
        out.push('<tr>');
        head.forEach((_, n) => out.push(`<td${align[n] || ''}>${renderInline(row[n] || '')}</td>`));
        out.push('</tr>');
      }
      out.push('</tbody></table></div>');
      continue;
    }

    // 列表
    const listItem = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (listItem) {
      flushParagraph(paragraph);
      const ordered = /\d/.test(listItem[2]);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (!m) {
          // 列表项的续行（缩进且非空）
          if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) {
            items[items.length - 1].text += `\n${lines[i].trim()}`;
            i++;
            continue;
          }
          break;
        }
        const task = m[3].match(/^\[([ xX])\]\s*(.*)$/);
        items.push({
          text: task ? task[2] : m[3],
          task: task ? task[1].toLowerCase() === 'x' : null,
        });
        i++;
      }
      out.push(ordered ? '<ol>' : '<ul>');
      for (const item of items) {
        const inner = renderInline(joinParagraph(item.text.split('\n')));
        if (item.task === null) {
          out.push(`<li>${inner}</li>`);
        } else {
          out.push(
            `<li class="task-item"><input type="checkbox" disabled${item.task ? ' checked' : ''}> <span>${inner}</span></li>`
          );
        }
      }
      out.push(ordered ? '</ol>' : '</ul>');
      continue;
    }

    // 普通段落
    paragraph.push(line);
    i++;
  }
  flushParagraph(paragraph);
  return { html: out.join('\n'), toc };
}

// ── 阅读时长 ─────────────────────────────────────────────────────────────────
function readingTime(text) {
  const stripped = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*`_|-]/g, ' ');
  const cjk = (stripped.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (stripped.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 380 + words / 200));
}

const formatDate = (iso) => iso.replace(/-/g, '.');
const isoDate = (d) => (/^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0, 10) : d);

// ── 读取文章 ─────────────────────────────────────────────────────────────────
function loadPosts() {
  if (!existsSync(POSTS_DIR)) throw new Error(`找不到文章目录：${POSTS_DIR}`);
  const posts = [];
  for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).sort()) {
    const source = readFileSync(resolve(POSTS_DIR, file), 'utf8');
    const { meta, body } = parseFrontMatter(source, file);
    const slug = (meta.slug || file.replace(/\.md$/, '')).trim();
    if (!meta.title) throw new Error(`${file}: frontmatter 缺少 title`);
    if (!meta.date) throw new Error(`${file}: frontmatter 缺少 date`);
    const category = byCategoryName.get(meta.category) || byCategoryKey.get(meta.category) || DEFAULT_CATEGORY;
    const { html, toc } = renderMarkdown(body);
    posts.push({
      slug,
      file,
      title: String(meta.title),
      date: isoDate(String(meta.date)),
      category,
      tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
      description: String(meta.description || ''),
    subtitle: String(meta.subtitle || ''),
      cover: String(meta.cover || ''),
      draft: meta.draft === true,
      html,
      toc,
      minutes: readingTime(body),
      words: body.replace(/\s+/g, '').length,
    });
  }
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
  return posts;
}

// ── 卡片与页面模板 ───────────────────────────────────────────────────────────
function cardHtml(post, prefix) {
  const cover = post.cover
    ? `<a class="post-card__cover" href="${attr(prefix + post.slug + '.html')}" tabindex="-1" aria-hidden="true"><img src="${attr(prefix + post.cover)}" alt="" loading="lazy" decoding="async"></a>`
    : '';
  const tags = post.tags
    .map((t) => `<span class="post-card__tag">${escapeHtml(t)}</span>`)
    .join('');
  const haystack = [post.title, post.description, post.tags.join(' '), post.category.name]
    .join(' ')
    .toLowerCase();
  return [
    `<article class="post-card${post.cover ? '' : ' post-card--no-cover'}"`,
    ` data-slug="${attr(post.slug)}"`,
    ` data-category="${attr(post.category.key)}"`,
    ` data-date="${attr(post.date)}"`,
    ` data-title="${attr(post.title)}"`,
    ` data-search="${attr(haystack)}">`,
    cover,
    '<div class="post-card__body">',
    '<div class="post-card__meta">',
    `<a class="post-card__category" href="${attr(prefix + 'index.html')}?category=${attr(post.category.key)}">${escapeHtml(post.category.name)}</a>`,
    `<time datetime="${attr(post.date)}">${formatDate(post.date)}</time>`,
    `<span class="post-card__time">${post.minutes} 分钟</span>`,
    '</div>',
    `<h3 class="post-card__title"><a href="${attr(prefix + post.slug + '.html')}">${escapeHtml(post.title)}</a></h3>`,
    post.description ? `<p class="post-card__excerpt">${escapeHtml(post.description)}</p>` : '',
    tags ? `<div class="post-card__tags">${tags}</div>` : '',
    '</div>',
    '</article>',
  ]
    .filter(Boolean)
    .join('\n');
}

function latestItemHtml(post) {
  return [
    `<li class="latest-item" data-category="${attr(post.category.key)}">`,
    `<a class="latest-item__title" href="blog/${attr(post.slug)}.html">${escapeHtml(post.title)}</a>`,
    '<span class="latest-item__meta">',
    `<span class="latest-item__category">${escapeHtml(post.category.name)}</span>`,
    `<time datetime="${attr(post.date)}">${formatDate(post.date)}</time>`,
    '</span>',
    post.description ? `<p class="latest-item__excerpt">${escapeHtml(post.description)}</p>` : '',
    '</li>',
  ]
    .filter(Boolean)
    .join('\n');
}

function headerHtml(prefix, active) {
  const link = (href, label, key) =>
    `<a href="${href}"${key === active ? ' class="is-active" aria-current="page"' : ''}>${label}</a>`;
  return [
    '<header class="site-header" data-header>',
    `<a class="brand" href="${prefix}index.html" aria-label="返回首页">${SITE_NAME}</a>`,
    '<nav class="site-nav" aria-label="主导航">',
    link(`${prefix}index.html#about`, '关于'),
    link(`${prefix}index.html#notes`, '动态'),
    link(`${prefix}index.html#work`, '项目'),
    link(`${prefix}index.html`, '博客', 'blog'),
    link(`${prefix}index.html#travel`, '旅行足迹'),
    link(`${prefix}index.html#contact`, '联系'),
    '</nav>',
    '</header>',
  ].join('\n    ');
}

function tocHtml(toc) {
  if (!toc.length) return '';
  const items = toc
    .map(
      (h) =>
        `<li class="toc__item toc__item--h${h.level}"><a href="#${attr(h.id)}">${escapeHtml(h.text)}</a></li>`
    )
    .join('\n');
  return [
    '<nav class="toc" aria-labelledby="toc-title">',
    '<p class="toc__title" id="toc-title">目录</p>',
    `<ol class="toc__list">${items}</ol>`,
    '</nav>',
  ].join('');
}

function postPage(post, prev, next) {
  const url = `${SITE_URL}/blog/${post.slug}.html`;
  const description = post.description || `${post.title} —— ${SITE_NAME}的博客`;
  const ogImage = post.cover ? `${SITE_URL}/blog/${post.cover}` : `${SITE_URL}/assets/avatar.jpg`;
  const tags = post.tags
    .map((t) => `<a class="post__tag" href="index.html?tag=${encodeURIComponent(t)}">#${escapeHtml(t)}</a>`)
    .join('');
  const hasMath = /\$\$[\s\S]*?\$\$|\$[^$\n]+\$/.test(post.html);
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(post.title)} | ${SITE_NAME}的博客</title>
    <meta name="description" content="${attr(description)}" />
    <link rel="canonical" href="${attr(url)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${attr(post.title)}" />
    <meta property="og:description" content="${attr(description)}" />
    <meta property="og:url" content="${attr(url)}" />
    <meta property="og:image" content="${attr(ogImage)}" />
    <meta property="og:site_name" content="${attr(SITE_NAME)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="article:published_time" content="${attr(post.date)}" />
    <link rel="stylesheet" href="../styles.css" />
    <link rel="stylesheet" href="blog.css" />
  </head>
  <body class="blog-body">
    <a class="skip-link" href="#post-content">跳到正文</a>
    ${headerHtml('../', 'blog')}

    <main class="blog-page" id="post-content">
      <article class="post">
        <header class="post__header">
          <p class="post__eyebrow"><a href="index.html?category=${attr(post.category.key)}">${escapeHtml(post.category.name)}</a><span>·</span><span>${escapeHtml(post.category.en)}</span></p>
          <h1 class="post__title">${escapeHtml(post.title)}</h1>
          ${post.subtitle ? `<p class="post__subtitle">${escapeHtml(post.subtitle)}</p>` : ''}
          ${post.description ? `<p class="post__description">${escapeHtml(post.description)}</p>` : ''}
          <div class="post__meta">
            <time datetime="${attr(post.date)}">${formatDate(post.date)}</time>
            <span>·</span><span>${post.minutes} 分钟读完</span>
            <span>·</span><span>约 ${post.words} 字</span>
          </div>
          ${tags ? `<div class="post__tags">${tags}</div>` : ''}
        </header>

        <div class="post__layout${post.toc.length ? ' post__layout--with-toc' : ''}">
          ${tocHtml(post.toc)}
          <div class="post__content">
${post.html}
          </div>
        </div>

        <footer class="post__footer">
          <nav class="post__nav" aria-label="文章导航">
            ${
              prev
                ? `<a class="post__nav-link post__nav-link--prev" href="${attr(prev.slug)}.html"><span>上一篇</span><strong>${escapeHtml(prev.title)}</strong></a>`
                : '<span class="post__nav-link post__nav-link--empty"></span>'
            }
            ${
              next
                ? `<a class="post__nav-link post__nav-link--next" href="${attr(next.slug)}.html"><span>下一篇</span><strong>${escapeHtml(next.title)}</strong></a>`
                : '<span class="post__nav-link post__nav-link--empty"></span>'
            }
          </nav>
          <p class="post__back"><a href="index.html">← 返回全部文章</a></p>
        </footer>
      </article>
    </main>

    <footer class="site-footer">
      <p>&copy; <span data-year></span> ${SITE_NAME}. All rights reserved.</p>
    </footer>

    ${hasMath ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">' : ''}
    <script src="blog.js"></script>
    ${hasMath ? '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>\n    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>' : ''}
  </body>
</html>
`;
}

// ── 注入工具 ─────────────────────────────────────────────────────────────────
function inject(file, startMarker, endMarker, content, label) {
  if (!existsSync(file)) {
    console.log(`  ! 跳过 ${label}：找不到 ${file}`);
    return false;
  }
  const source = readFileSync(file, 'utf8');
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    console.log(`  ! 跳过 ${label}：${file} 中缺少注入标记`);
    return false;
  }
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const body = content.split('\n').join(eol);
  const updated =
    source.slice(0, start + startMarker.length) + eol + body + eol + source.slice(end);
  if (updated === source) {
    console.log(`  = ${label}：内容无变化`);
    return false;
  }
  writeFileSync(file, updated);
  console.log(`  ✓ ${label}`);
  return true;
}

// ── 主流程 ───────────────────────────────────────────────────────────────────
const all = loadPosts();
const posts = all.filter((p) => INCLUDE_DRAFTS || !p.draft);
const drafts = all.length - posts.length;
console.log(`读取 ${all.length} 篇文章（跳过草稿 ${drafts} 篇，生成 ${posts.length} 篇）`);

// 记录本次生成了哪些页面：下次构建用它清理已经失效的旧页面
const MANIFEST = resolve(BLOG_DIR, '.generated.json');
let previouslyGenerated = [];
if (existsSync(MANIFEST)) {
  try {
    previouslyGenerated = JSON.parse(readFileSync(MANIFEST, 'utf8')).files || [];
  } catch {
    previouslyGenerated = [];
  }
}

const generatedPages = [];
for (const post of posts) {
  const index = posts.indexOf(post);
  const prev = posts[index + 1] || null; // 列表按日期从新到旧，所以「上一篇」是更早的
  const next = posts[index - 1] || null;
  const file = `${post.slug}.html`;
  writeFileSync(resolve(BLOG_DIR, file), postPage(post, prev, next));
  generatedPages.push(file);
  console.log(`  ✓ blog/${file}  ${post.title}（${post.category.name} · ${post.date} · ${post.minutes} 分钟）`);
}

// 文章被删除、改名或改成草稿后，上一次生成的页面要一并清掉，
// 否则会留下一个能直接访问、却已经不在列表里的孤儿页面。
const { unlinkSync } = await import('node:fs');
for (const file of previouslyGenerated) {
  if (generatedPages.includes(file)) continue;
  if (!/^[\w.-]+\.html$/.test(file)) continue; // 只处理形如 <slug>.html 的名字，避免误删
  const target = resolve(BLOG_DIR, file);
  if (existsSync(target)) {
    unlinkSync(target);
    console.log(`  ✗ 移除已失效页面 blog/${file}`);
  }
}
writeFileSync(
  MANIFEST,
  `${JSON.stringify(
    {
      note: '由 tools/build-blog.mjs 维护：记录已生成的文章页面，用于在下次构建时清理失效页面。',
      files: generatedPages,
    },
    null,
    2
  )}\n`
);

// 列表页：没有文章时给一句友好的提示，而不是留一片空白
const listContent = posts.length
  ? posts.map((p) => cardHtml(p, '')).join('\n')
  : '<p class="blog-empty__inline">这里还没有文章。把 Markdown 文件放进 blog/posts/，再运行一次 node tools/build-blog.mjs 就会出现。</p>';

inject(
  resolve(BLOG_DIR, 'index.html'),
  '<!-- BLOG:LIST:START -->',
  '<!-- BLOG:LIST:END -->',
  listContent,
  '博客列表卡片 → blog/index.html'
);

// 分类筛选按钮同样由脚本生成，保证分类只在 CATEGORIES 一处定义
const categoryButtons = [...CATEGORIES]
  .sort((a, b) => a.order - b.order)
  .map((c) => {
    const count = posts.filter((p) => p.category.key === c.key).length;
    return [
      `<button class="blog-filter" type="button" data-filter="${attr(c.key)}"`,
      ` data-description="${attr(c.description)}" aria-pressed="false">`,
      `${escapeHtml(c.name)}<span class="blog-filter__count">${count}</span></button>`,
    ].join('');
  })
  .join('\n');

inject(
  resolve(BLOG_DIR, 'index.html'),
  '<!-- BLOG:CATEGORIES:START -->',
  '<!-- BLOG:CATEGORIES:END -->',
  categoryButtons,
  '分类筛选按钮 → blog/index.html'
);

// blog/index.html 只有样式表链接需要脚本保证，其余标记由人工维护
function ensureBlogStylesheet(file, label) {
  if (!existsSync(file)) {
    console.log(`  ! 跳过 ${label}：找不到 ${file}`);
    return;
  }
  const source = readFileSync(file, 'utf8');
  if (source.includes('href="blog.css"')) {
    console.log(`  = ${label}：已存在`);
    return;
  }
  const anchor = '<link rel="stylesheet" href="../styles.css" />';
  if (!source.includes(anchor)) {
    console.log(`  ! 跳过 ${label}：找不到 styles.css 链接`);
    return;
  }
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  writeFileSync(file, source.replace(anchor, `${anchor}${eol}    <link rel="stylesheet" href="blog.css" />`));
  console.log(`  ✓ ${label}`);
}
ensureBlogStylesheet(resolve(BLOG_DIR, 'index.html'), '博客样式表 → blog/index.html');

inject(
  resolve(root, 'index.html'),
  '<!-- BLOG:LATEST:START -->',
  '<!-- BLOG:LATEST:END -->',
  posts.slice(0, 3).map(latestItemHtml).join('\n'),
  '首页最新文章 → index.html'
);

// 分类清单供核对
console.log('分类：');
for (const c of [...CATEGORIES].sort((a, b) => a.order - b.order)) {
  const n = posts.filter((p) => p.category.key === c.key).length;
  console.log(`  ${c.name}（${c.en}）${n} 篇`);
}
