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

function toggleTimeline() {
  const hiddenTimeline = document.getElementById("hidden-timeline");
  const expandBtn = document.getElementById("expand-btn");
  
  if (hiddenTimeline && expandBtn) {
    hiddenTimeline.classList.toggle("is-open");
    
    if (hiddenTimeline.classList.contains("is-open")) {
      expandBtn.textContent = "收起动态";
    } else {
      expandBtn.textContent = "展开动态";
    }
  }
}

function toggleHobbyVideos(videoId, btn) {
  const videoContainer = document.getElementById(videoId);
  
  if (videoContainer) {
    videoContainer.classList.toggle("is-open");
    
    if (videoContainer.classList.contains("is-open")) {
      btn.textContent = "收起集锦";
    } else {
      btn.textContent = "查看集锦";
    }
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const photos = document.querySelectorAll(".update-media img");
  
  photos.forEach(function(img) {
    img.addEventListener("click", function(e) {
      e.stopPropagation();
      if (this.classList.contains("zoomed")) {
        this.classList.remove("zoomed");
      } else {
        this.classList.add("zoomed");
      }
    });
  });
  
  document.addEventListener("click", function(e) {
    const zoomedImg = document.querySelector(".update-media img.zoomed");
    if (zoomedImg && !e.target.classList.contains("zoomed")) {
      zoomedImg.classList.remove("zoomed");
    }
  });
});
