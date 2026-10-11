/* 博客前端脚本。
   列表页与文章页共用这一个文件，所有功能都先判断元素是否存在，
   因此在没有对应结构的页面上会自动跳过，不会报错。 */
(() => {
  const yearNode = document.querySelector('[data-year]');
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  const header = document.querySelector('[data-header]');
  const updateHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ── 代码块一键复制 ─────────────────────────────────────────────── */
  document.querySelectorAll('.code-block__copy').forEach((button) => {
    button.addEventListener('click', async () => {
      const code = button.closest('.code-block')?.querySelector('code');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = '已复制';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = '请按 Ctrl+C';
      }
      window.setTimeout(() => {
        button.textContent = '复制';
      }, 1800);
    });
  });

  /* ── 正文图片点击放大 ───────────────────────────────────────────── */
  const zoomables = [...document.querySelectorAll('.post__content img')];
  if (zoomables.length) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.hidden = true;
    overlay.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="关闭">×</button><img alt="">';
    document.body.append(overlay);
    const overlayImage = overlay.querySelector('img');
    const close = () => {
      overlay.hidden = true;
      document.body.classList.remove('has-lightbox');
    };
    zoomables.forEach((image) => {
      image.classList.add('is-zoomable');
      image.addEventListener('click', () => {
        overlayImage.src = image.currentSrc || image.src;
        overlayImage.alt = image.alt || '';
        overlay.hidden = false;
        document.body.classList.add('has-lightbox');
      });
    });
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('.lightbox__close')) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !overlay.hidden) close();
    });
  }

  /* ── 文章目录：滚动时高亮当前小节 ───────────────────────────────── */
  const tocLinks = [...document.querySelectorAll('.toc__list a')];
  if (tocLinks.length) {
    const targets = tocLinks
      .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
      .filter(Boolean);
    if (targets.length) {
      const spy = () => {
        let current = targets[0];
        targets.forEach((target) => {
          if (target.getBoundingClientRect().top <= 120) current = target;
        });
        tocLinks.forEach((link) => {
          link.classList.toggle('is-active', link.hash === `#${current.id}`);
        });
      };
      spy();
      window.addEventListener('scroll', spy, { passive: true });
    }
  }

  /* ── 数学公式：只有页面真的加载了 KaTeX 才调用 ──────────────────── */
  window.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.post__content');
    if (content && typeof window.renderMathInElement === 'function') {
      window.renderMathInElement(content, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
      });
    }
  });

  /* ── 列表页：分类筛选 + 搜索 + 排序 ─────────────────────────────── */
  const list = document.getElementById('blog-list');
  if (!list) return;

  const cards = [...list.querySelectorAll('.post-card')];
  const filters = [...document.querySelectorAll('.blog-filter')];
  const searchInput = document.getElementById('blog-search');
  const sortRoot = document.querySelector('[data-sort]');
  const sortButton = sortRoot ? sortRoot.querySelector('.blog-sort__button') : null;
  const sortValueNode = sortRoot ? sortRoot.querySelector('.blog-sort__value') : null;
  const sortMenu = sortRoot ? sortRoot.querySelector('.blog-sort__menu') : null;
  const sortOptions = sortMenu ? [...sortMenu.querySelectorAll('.blog-sort__option')] : [];
  const hint = document.getElementById('blog-hint');
  const empty = document.getElementById('blog-empty');
  const resetButton = document.getElementById('blog-reset');
  const state = { category: 'all', query: '', sort: 'new' };

  const readParams = () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const tag = params.get('tag');
    if (category && filters.some((filter) => filter.dataset.filter === category)) {
      state.category = category;
    }
    if (tag) state.query = tag;
  };

  const render = () => {
    const query = state.query.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matchesCategory = state.category === 'all' || card.dataset.category === state.category;
      const matchesQuery = !query || (card.dataset.search || '').includes(query);
      const show = matchesCategory && matchesQuery;
      card.hidden = !show;
      if (show) visible += 1;
    });

    const sorted = [...cards].sort((a, b) => {
      if (state.sort === 'title') {
        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
      }
      const byDate = (a.dataset.date || '').localeCompare(b.dataset.date || '');
      return state.sort === 'old' ? byDate : -byDate;
    });
    sorted.forEach((card) => list.append(card));

    const active = filters.find((filter) => filter.dataset.filter === state.category);
    const description = active?.dataset.description || '';
    const count =
      state.category === 'all' && !query
        ? `共 ${cards.length} 篇文章`
        : `共 ${cards.length} 篇，当前显示 ${visible} 篇`;
    if (hint) hint.textContent = description ? `${description} ${count}` : count;

    if (empty) empty.hidden = visible > 0;
    list.hidden = visible === 0;
    filters.forEach((filter) => {
      const on = filter.dataset.filter === state.category;
      filter.classList.toggle('is-active', on);
      filter.setAttribute('aria-pressed', String(on));
    });
  };

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      state.category = filter.dataset.filter || 'all';
      render();
    });
  });
  searchInput?.addEventListener('input', () => {
    state.query = searchInput.value;
    render();
  });
  // 排序用自绘下拉：原生 select 的弹出列表由系统绘制，无法跟随站点样式。
  const sortLabels = new Map(sortOptions.map((option) => [option.dataset.value, option.textContent.trim()]));
  let sortCursor = 0;

  const syncSortLabel = (value) => {
    if (sortValueNode) sortValueNode.textContent = sortLabels.get(value) || value;
    sortOptions.forEach((option) => {
      option.setAttribute('aria-selected', String(option.dataset.value === value));
    });
  };
  const highlightSort = (index) => {
    if (!sortOptions.length) return;
    sortCursor = (index + sortOptions.length) % sortOptions.length;
    sortOptions.forEach((option, n) => option.classList.toggle('is-active', n === sortCursor));
  };
  const closeSortMenu = () => {
    sortMenu.hidden = true;
    sortRoot.classList.remove('is-open');
    sortButton.setAttribute('aria-expanded', 'false');
  };
  const openSortMenu = () => {
    sortMenu.hidden = false;
    sortRoot.classList.add('is-open');
    sortButton.setAttribute('aria-expanded', 'true');
    highlightSort(sortOptions.findIndex((option) => option.dataset.value === state.sort));
  };
  const chooseSort = (value) => {
    state.sort = value;
    syncSortLabel(value);
    closeSortMenu();
    sortButton.focus();
    render();
  };

  if (sortRoot && sortButton && sortMenu && sortOptions.length) {
    // 整个胶囊都可点（包括左侧的「排序」文字）；点选项时交给选项自己的处理
    sortRoot.addEventListener('click', (event) => {
      if (event.target.closest('.blog-sort__option')) return;
      if (sortMenu.hidden) openSortMenu();
      else closeSortMenu();
    });
    sortOptions.forEach((option) => {
      option.addEventListener('click', () => chooseSort(option.dataset.value));
      option.addEventListener('mousemove', () => highlightSort(sortOptions.indexOf(option)));
    });
    sortRoot.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!sortMenu.hidden) {
          closeSortMenu();
          sortButton.focus();
        }
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (sortMenu.hidden) openSortMenu();
        else chooseSort(sortOptions[sortCursor].dataset.value);
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (sortMenu.hidden) openSortMenu();
      if (event.key === 'ArrowDown') highlightSort(sortCursor + 1);
      if (event.key === 'ArrowUp') highlightSort(sortCursor - 1);
      if (event.key === 'Home') highlightSort(0);
      if (event.key === 'End') highlightSort(sortOptions.length - 1);
    });
    document.addEventListener('click', (event) => {
      if (!sortRoot.contains(event.target)) closeSortMenu();
    });
    syncSortLabel(state.sort);
  }
  resetButton?.addEventListener('click', () => {
    state.category = 'all';
    state.query = '';
    state.sort = 'new';
    if (searchInput) searchInput.value = '';
    syncSortLabel('new');
    // file:// 下浏览器可能拒绝 replaceState，失败时跳过地址栏清理即可，不要连累筛选重置
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      /* 忽略：地址栏上残留的查询参数不影响功能 */
    }
    render();
  });

  readParams();
  if (searchInput && state.query) searchInput.value = state.query;
  render();
})();
