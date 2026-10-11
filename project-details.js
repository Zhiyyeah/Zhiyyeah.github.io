(() => {
  const projects = window.projectDetails || {};
  const dialog = document.getElementById('project-dialog');
  const content = document.getElementById('project-detail-content');
  if (!dialog || !content) return;

  let lastTrigger = null;
  let previousHash = '#work';
  let activeProject = null;

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  function renderProject(project) {
    dialog.dataset.theme = project.theme;
    const heading = node('header', 'project-detail__heading');
    const label = node('div', 'project-detail__labels');
    label.append(node('span', 'eyebrow', project.category), node('span', 'project-detail__status', project.status));
    const title = node('h2', '', project.title);
    title.id = 'project-detail-title';
    heading.append(label, title, node('p', 'project-detail__subtitle', project.subtitle));
    const introduction = node('p', 'project-detail__intro', project.intro);
    const metadata = node('div', 'project-detail__meta');
    metadata.append(node('span', '', project.period), node('span', '', `我的职责：${project.role}`));
    const metrics = node('dl', 'project-detail__metrics');
    for (let index = 1; index <= 3; index++) {
      const item = node('div');
      item.append(node('dt', '', project[`metric${index}Label`]), node('dd', '', project[`metric${index}`]));
      metrics.append(item);
    }

    const layout = node('div', 'project-detail__layout');
    const narrative = node('div', 'project-detail__narrative');
    project.sections.forEach(section => {
      const block = node('section', 'project-detail__section');
      block.append(node('h3', '', section.title));
      section.paragraphs.forEach(text => block.append(node('p', '', text)));
      if (section.bullets.length) {
        const list = node('ul');
        section.bullets.forEach(text => list.append(node('li', '', text)));
        block.append(list);
      }
      narrative.append(block);
    });

    const gallery = node('section', 'project-gallery');
    gallery.setAttribute('aria-label', '项目图示');
    const galleryHeading = node('div', 'project-gallery__heading');
    const counter = node('span', 'project-gallery__counter');
    galleryHeading.append(node('h3', '', '项目图示'), counter);
    const figure = node('figure', 'project-gallery__figure');
    const viewport = node('div', 'project-gallery__viewport');
    const caption = node('figcaption');
    caption.setAttribute('aria-live', 'polite');
    figure.append(viewport, caption);
    const thumbnails = node('div', 'project-gallery__thumbnails');
    thumbnails.setAttribute('role', 'group');
    thumbnails.setAttribute('aria-label', '选择项目图示');
    const buttons = [];

    function selectImage(index) {
      const entry = project.gallery[index];
      viewport.classList.toggle('project-gallery__viewport--comparison', Boolean(entry.images));
      const panels = (entry.images || [entry]).map(item => {
        const imageLink = node('a', 'project-gallery__image-link');
        imageLink.target = '_blank';
        imageLink.rel = 'noopener';
        imageLink.href = item.src;
        imageLink.setAttribute('aria-label', `在新标签页查看原图：${item.caption}`);
        const image = node('img');
        image.src = item.src;
        image.alt = item.alt;
        image.decoding = 'async';
        imageLink.append(image);
        if (entry.images) imageLink.append(node('span', 'project-gallery__comparison-label', item.caption));
        return imageLink;
      });
      viewport.replaceChildren(...panels);
      caption.textContent = entry.caption;
      counter.textContent = `${index + 1} / ${project.gallery.length}`;
      buttons.forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
    }

    project.gallery.forEach((entry, index) => {
      const button = node('button', 'project-gallery__thumbnail');
      button.type = 'button';
      button.setAttribute('aria-label', `图 ${index + 1}：${entry.caption}`);
      if (entry.images) button.classList.add('project-gallery__thumbnail--comparison');
      (entry.images || [entry]).forEach(item => {
        const thumbnail = node('img');
        thumbnail.src = item.src;
        thumbnail.alt = '';
        thumbnail.decoding = 'async';
        button.append(thumbnail);
      });
      button.append(node('span', '', String(index + 1).padStart(2, '0')));
      button.addEventListener('click', () => selectImage(index));
      button.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        selectImage(next);
        buttons[next].focus();
      });
      buttons.push(button);
      thumbnails.append(button);
    });
    const featuredIndex = project.gallery.findIndex(entry => entry.caption === project.featured);
    selectImage(featuredIndex < 0 ? 0 : featuredIndex);
    const imageHint = node('p', 'project-gallery__hint', '点击图示可查看大图');
    const tags = node('ul', 'project-detail__tags');
    tags.setAttribute('aria-label', '使用的技术');
    project.tags.forEach(tag => tags.append(node('li', '', tag)));
    gallery.append(galleryHeading, figure, thumbnails, imageHint, tags);
    layout.append(narrative, gallery);

    const footer = node('footer', 'project-detail__footer');
    footer.append(node('span', '', project.source));
    content.replaceChildren(heading, introduction, metadata, metrics, layout, footer);
  }

  function openProject(id, trigger, updateHash = true) {
    const project = projects[id];
    if (!project) return;
    if (!dialog.open) {
      lastTrigger = trigger || document.querySelector(`[data-project="${id}"]`);
      previousHash = location.hash.startsWith('#project-') ? '#work' : location.hash || '#work';
    }
    activeProject = id;
    renderProject(project);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('has-project-dialog');
    if (updateHash) history.replaceState(null, '', `#project-${id}`);
  }

  document.querySelectorAll('[data-project]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openProject(trigger.dataset.project, trigger);
    });
  });
  dialog.querySelector('.project-detail__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('has-project-dialog');
    if (location.hash === `#project-${activeProject}`) history.replaceState(null, '', previousHash);
    lastTrigger?.focus({ preventScroll: true });
    activeProject = null;
  });
  function syncHash() {
    const id = location.hash.replace(/^#project-/, '');
    if (projects[id]) openProject(id, null, false);
    else if (dialog.open) dialog.close();
  }
  window.addEventListener('hashchange', syncHash);
  syncHash();
})();
