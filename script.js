const yearNode = document.querySelector("[data-year]");
const header = document.querySelector("[data-header]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const updateActiveLink = () => {
  const current = sections
    .map((section) => ({
      id: section.id,
      top: Math.abs(section.getBoundingClientRect().top),
    }))
    .sort((a, b) => a.top - b.top)[0];

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.hash === `#${current?.id}`);
  });
};

updateHeader();
updateActiveLink();

window.addEventListener("scroll", () => {
  updateHeader();
  updateActiveLink();
});
