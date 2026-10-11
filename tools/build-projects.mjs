// Keep the website usable when index.html is opened directly, without fetch or a build service.
// After editing the project Markdown files, run: node tools/build-projects.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = resolve(root, 'assets/project');
const projects = {};
for (const id of ['super-resolution', 'vegetation', 'sea-ice', 'internship']) {
  const source = readFileSync(resolve(directory, `${id}.md`), 'utf8').replace(/\r\n/g, '\n');
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Missing front matter: ${id}`);
  const metadata = Object.fromEntries(match[1].split('\n').map(line => {
    const colon = line.indexOf(':');
    if (colon < 0) throw new Error(`Invalid metadata: ${line}`);
    return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
  }));
  const project = { ...metadata, tags: metadata.tags.split(',').map(tag => tag.trim()), intro: '', sections: [], gallery: [] };
  let section = null;
  let imageGroup = null;
  for (const line of match[2].split('\n')) {
    if (!line.trim() || /^# /.test(line)) continue;
    if (line.startsWith('## ')) {
      imageGroup = null;
      section = { title: line.slice(3), paragraphs: [], bullets: [] };
      if (section.title !== '图示') project.sections.push(section);
    } else if (line.startsWith('### ') && section?.title === '图示') {
      imageGroup = { caption: line.slice(4), images: [] };
      project.gallery.push(imageGroup);
    } else if (line.startsWith('![')) {
      const figure = line.match(/^!\[([^\]]+)\]\(([^\s)]+)(?: "([^"]+)")?\)$/);
      if (!figure || !/\.jpg$/i.test(figure[2]) || !existsSync(resolve(directory, figure[2]))) throw new Error(`Invalid or missing JPG image: ${line}`);
      const image = { src: `assets/project/${figure[2]}`, alt: figure[1], caption: figure[3] || figure[1] };
      if (imageGroup) imageGroup.images.push(image);
      else project.gallery.push(image);
    } else if (line.startsWith('- ')) {
      if (!section) throw new Error(`Bullet outside section: ${id}`);
      section.bullets.push(line.slice(2));
    } else if (section) {
      section.paragraphs.push(line);
    } else {
      project.intro += line;
    }
  }
  const imageCount = project.gallery.reduce((count, entry) => count + (entry.images?.length ?? 1), 0);
  if (project.gallery.some(entry => entry.images && entry.images.length !== 2)) throw new Error(`Comparison requires two images: ${id}`);
  if (metadata.featured && !project.gallery.some(entry => entry.caption === metadata.featured)) throw new Error(`Missing featured figure: ${id}`);
  if (metadata.id !== id || !project.intro || !project.sections.length || !project.gallery.length || imageCount > 5) {
    throw new Error(`Incomplete project or too many figures: ${id}`);
  }
  project.markdown = `assets/project/${id}.md`;
  projects[id] = project;
}
writeFileSync(resolve(directory, 'projects.js'), '// Generated from project Markdown by tools/build-projects.mjs.\nwindow.projectDetails = ' + JSON.stringify(projects, null, 2) + ';\n');
console.log(`Prepared ${Object.keys(projects).length} project details.`);
