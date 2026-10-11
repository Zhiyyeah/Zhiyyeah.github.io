# 博客维护说明

博客由 **Markdown 文件 + 一个构建脚本** 驱动，没有数据库、没有后台、没有第三方服务。
新增文章只需要往 `blog/posts/` 放一个 `.md` 文件，然后运行一次构建脚本。

```
blog/
├── posts/              文章源文件（Markdown + frontmatter），网站的“内容”
│   └── *.md
├── assets/             文章与封面用的图片
├── blog.css            博客样式（与站点共用 styles.css 里的配色变量）
├── blog.js             列表页筛选/搜索/排序 + 文章页目录、代码复制、图片放大
├── index.html          博客列表页（卡片由构建脚本注入）
└── <slug>.html         每篇文章的独立页面（构建脚本生成，不要手改）
```

## 一、新增一篇文章

1. 在 `blog/posts/` 新建 `my-post.md`，**文件名就是网址**：`my-post.md` → `/blog/my-post.html`。
   建议用小写英文、数字和短横线，不要用中文文件名。
2. 文件开头写 frontmatter（两行 `---` 之间）：

```yaml
---
title: "文章标题"
subtitle: "副标题（可选，显示在标题下方）"
date: 2026-10-12
category: "科研笔记"
tags: ["GOCI-2", "超分辨率"]
description: "一两句话的摘要，会出现在列表卡片、搜索结果和页面 SEO 描述里。"
cover: "assets/my-cover.jpg"
draft: false
---
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✅ | 文章标题，支持中文 |
| `subtitle` | 可选 | 副标题，会显示在文章标题下方 |
| `date` | ✅ | 发布日期 `YYYY-MM-DD`，列表默认按它从新到旧排序 |
| `category` | 建议 | 只能是四个分类之一，写错会归到「科研笔记」 |
| `tags` | 建议 | 数组写法 `["a", "b"]`，或写成 `- a` 的列表写法 |
| `description` | 建议 | 摘要；不写的话列表卡片就没有摘要 |
| `cover` | 可选 | 封面图，路径相对 `blog/`；留空则不显示封面 |
| `draft` | 可选 | `true` 时完全不参与构建，网站上看不到 |
| `slug` | 可选 | 想自定义网址时写它，默认用文件名 |

3. 运行构建脚本，然后提交推送：

```bash
node tools/build-blog.mjs     # 生成文章页 + 刷新列表卡片 + 刷新首页「最新文章」

git add -A
git commit -m "新增文章：文章标题"
git push origin main
```

构建脚本会做五件事：

1. 为每篇文章生成独立静态页 `blog/<slug>.html`（含目录、上下篇导航、SEO 元数据）；
2. 把卡片写进 `blog/index.html` 的 `<!-- BLOG:LIST:START -->` 与 `<!-- BLOG:LIST:END -->` 之间；
3. 按 `CATEGORIES` 生成分类筛选按钮（`<!-- BLOG:CATEGORIES:... -->` 之间）；
4. 把最新三篇写进首页 `index.html` 的 `<!-- BLOG:LATEST:START -->` 与 `<!-- BLOG:LATEST:END -->` 之间；
5. 清理失效页面：脚本把生成过的页面记在 `blog/.generated.json` 里，文章被删除、改名或改成 `draft: true` 之后，
   对应的旧页面会在下次构建时自动删除，不会留下能直接访问、却已经不在列表里的孤儿链接。

**不要手动维护任何索引**，也不要去改 `blog/<slug>.html`——它们每次构建都会被覆盖。

## 二、插入图片

图片放在 `blog/assets/`，正文里用相对 `blog/` 的路径引用：

```markdown
![图片说明](assets/我的图片.jpg)
```

- `alt` 文字会同时作为图注显示在图片下方；
- 正文图片点击后会放大显示（Esc 或点背景关闭）；
- 封面在 frontmatter 的 `cover` 字段里写同样的相对路径。

## 三、支持的 Markdown 语法

标题、段落、**加粗**、*斜体*、~~删除线~~、`行内代码`、有序/无序/任务列表、引用、表格、围栏代码块（语法高亮 + 一键复制）、分隔线、图片、链接、行内公式 `$...$` 与块级公式 `$$...$$`。

几点约定：

- 正文标题会自动降一级（文章标题已占用一级标题），所以用 `##` 起小节、`###` 起子小节；
- 段落之间空一行；段内换行不会产生新段落，中文之间也不会被插入多余空格；
- 代码块写上语言名才会高亮：<code>```python</code>、<code>```bash</code>、<code>```javascript</code> 等；
- 公式只有文章里真的出现 `$` 或 `$$` 时才会去加载 KaTeX（走 jsDelivr CDN），不用公式的文章完全不依赖网络；
  如果 CDN 在读者网络下不可达，公式会以原始 TeX 文本显示，**不会影响页面其他部分**。想彻底摆脱这个外部依赖，
  可以把 KaTeX 的 CSS/JS/字体下载到 `blog/assets/` 并改写 `tools/build-blog.mjs` 里的三处 URL；
- 引用块里同样可以放列表和代码。

## 四、修改分类

分类只在 `tools/build-blog.mjs` 顶部的 `CATEGORIES` 数组里定义一处：

```js
const CATEGORIES = [
  { key: 'research', name: '科研笔记', en: 'Research', description: '遥感、深度学习、论文阅读与科研心得。', order: 1 },
  ...
];
```

- `name` 是 frontmatter 里 `category` 要填的值；
- `key` 用于网址参数与样式钩子（例如 `[data-category="ideas"]` 就是「奇思妙想」的专属样式）；
- `description` 会显示在列表页筛选栏的说明文字里；
- `order` 决定筛选按钮的排列顺序。

改完重新构建即可，分类按钮会自动更新。**改 `key` 时记得同时改 `blog/blog.css` 里对应的选择器。**

## 五、草稿与本地预览

```bash
node tools/build-blog.mjs --drafts   # 连 draft: true 的文章一起生成，用来本地看效果
node tools/build-blog.mjs            # 正式构建，会跳过草稿
```

草稿文章在正式构建里既不生成页面、也不出现在列表，所以不会被别人看到。
用 `--drafts` 生成的草稿页面**不要提交**。

## 六、列表页的功能

- **分类筛选**：点分类按钮过滤；也支持 `?category=tech` 直接进入某个分类（首页卡片上的分类标签就是这个链接）。
- **搜索**：匹配标题、摘要、标签和分类名，输入即筛选。
- **排序**：最新优先 / 最早优先 / 按标题。默认最新优先。
- **空状态**：没有文章、或者筛选后没有结果时都会给出提示，并带一个「清除筛选」按钮。

这三件事全在浏览器里完成，用的是静态卡片上的 `data-*` 属性，不需要服务器，也不需要额外请求。
即使浏览器禁用 JavaScript，静态生成的卡片列表依然可见。

## 七、样式与部署

- 博客样式在 `blog/blog.css`，配色、圆角、阴影、过渡都复用 `styles.css` 里的 CSS 变量，
  所以只要两个文件一起加载，博客与主页就是同一套视觉语言。**改配色请改 `styles.css` 的 `:root`。**
- 部署方式没变：推送到 `main`，GitHub Pages 直接发布仓库根目录。
- `_config.yml` 里把 `blog/posts/` 排除在发布之外，避免 Jekyll 把带 frontmatter 的 `.md`
  再渲染成一份没有样式的副本。**不要删掉这条排除**。
- 文章页是纯静态 HTML，所以直接访问、分享、刷新、被搜索引擎抓取都正常，不依赖 JavaScript 渲染正文。
