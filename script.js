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

document.addEventListener("DOMContentLoaded", function() {
  const travelPhotos = window.travelPhotos || [];
  const travelAlbum = document.getElementById("travel-album");
  const travelList = document.getElementById("travel-photo-list");
  const travelCount = document.getElementById("travel-album-count");
  const travelPlacesNode = document.getElementById("travel-place-list");
  const placeNames = {
    hangzhou: "杭州", xian: "西安", huashan: "华山", changsha: "长沙",
    hengshan: "衡山", qingdao: "青岛", yichang: "宜昌",
    dandong: "丹东", huangshan: "黄山", dongshan: "东山岛",
    jiuhuashan: "九华山", yantai: "烟台", wuhan: "武汉",
    "kuala-lumpur": "吉隆坡", singapore: "新加坡", nanchang: "南昌",
    xiamen: "厦门", quanzhou: "泉州", macau: "澳门",
    tulou: "漳州土楼", chongqing: "重庆", fuzhou: "福州",
    sanya: "三亚", "south-china-sea": "南海科考",
    taishan: "泰山", chuzhou: "滁州", suzhou: "苏州", yueyang: "岳阳",
    jinan: "济南", jieyang: "揭阳", dalian: "大连", hefei: "合肥",
    wuhu: "芜湖", nanjing: "南京",
  };
  const placeGroups = new Map();
  travelPhotos.forEach((photo) => {
    if (!placeGroups.has(photo.place)) placeGroups.set(photo.place, []);
    placeGroups.get(photo.place).push(photo);
  });
  const sortedPhotos = [...travelPhotos].sort((a, b) =>
    b.date.localeCompare(a.date) || b.index - a.index
  );
  function renderTravelPhotos(filter) {
    const visible = sortedPhotos.filter((photo) => {
      if (filter === "all") return true;
      if (filter === "china" || filter === "sea") return photo.region === filter;
      return photo.place === filter;
    });
    travelCount.textContent = `${visible.length} 张照片`;
    travelList.replaceChildren();
    const years = new Map();
    visible.forEach((photo) => {
      const year = photo.date.slice(0, 4);
      if (!years.has(year)) years.set(year, []);
      years.get(year).push(photo);
    });
    years.forEach((photos, year) => {
      const section = document.createElement("section");
      section.className = "travel-year-group";
      const heading = document.createElement("h4");
      heading.textContent = `${year} · ${photos.length} 张`;
      const grid = document.createElement("div");
      grid.className = "travel-photo-grid";
      photos.forEach((photo) => {
        const card = document.createElement("figure");
        card.className = "travel-photo-card";
        const link = document.createElement("a");
        link.href = photo.photo;
        link.target = "_blank";
        link.rel = "noopener";
        link.setAttribute("aria-label", `查看${photo.title}照片`);
        const image = document.createElement("img");
        image.src = photo.photo;
        image.alt = `${photo.title}，${photo.location}`;
        image.loading = "lazy";
        image.decoding = "async";
        link.append(image);
        const caption = document.createElement("figcaption");
        const title = document.createElement("strong");
        title.textContent = photo.title;
        const place = document.createElement("span");
        place.textContent = photo.location;
        const time = document.createElement("time");
        time.dateTime = photo.date.slice(0, 10);
        time.textContent = `拍摄 ${photo.date.slice(0, 10)}`;
        caption.append(title, place, time);
        card.append(link, caption);
        grid.append(card);
      });
      section.append(heading, grid);
      travelList.append(section);
    });
    document.querySelectorAll("[data-travel-filter]").forEach((button) => {
      const selected = button.dataset.travelFilter === filter;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    document.querySelectorAll("[data-travel-place]").forEach((button) => {
      const selected = button.dataset.travelPlace === filter;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  document.querySelectorAll("[data-travel-filter]").forEach((button) => {
    button.addEventListener("click", () => renderTravelPhotos(button.dataset.travelFilter));
  });

  // Bounds match the Mercator projection of the local Natural Earth SVG maps.
  const travelMapBounds = {
    china: { minLng: 72, maxLng: 136, minLat: 17, maxLat: 55 },
    sea: { minLng: 98, maxLng: 107, minLat: 0, maxLat: 8 },
  };
  // Photos without GPS use landmark or regional references, never camera positions.
  const travelReferencePlaces = {
    xian: { lat: 34.385194, lng: 109.273444, kind: "地标" }, // UNESCO: Terracotta Army pits
    huashan: { lat: 34.4833, lng: 110.0833, kind: "地标" }, // Mount Hua scenic area
    chongqing: { lat: 29.56478, lng: 106.57422, kind: "地标" }, // Hongyadong
    tulou: { lat: 24.65, lng: 117.055, kind: "区域" }, // Zhangzhou Tulou regional reference
  };
  const mercatorY = (latitude) => Math.log(Math.tan(Math.PI / 4 + latitude * Math.PI / 360));
  const travelMapStages = [...document.querySelectorAll("[data-travel-map]")];
  travelMapStages.forEach((stage) => {
    const bounds = travelMapBounds[stage.dataset.travelMap];
    const markers = stage.querySelector(".travel-markers");
    const links = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    links.classList.add("travel-marker-links");
    links.setAttribute("aria-hidden", "true");
    markers.append(links);
    placeGroups.forEach((photos, placeId) => {
      const located = photos.find((photo) => photo.map === stage.dataset.travelMap);
      const reference = stage.dataset.travelMap === "china" ? travelReferencePlaces[placeId] : null;
      const position = located || reference;
      if (!position) return;
      const marker = document.createElement("button");
      marker.className = "travel-marker";
      marker.type = "button";
      marker.dataset.travelPlace = placeId;
      marker.setAttribute("aria-label", `${placeNames[placeId]}，查看 ${photos.length} 张照片`);
      marker.setAttribute("aria-pressed", "false");
      marker.title = placeNames[placeId];
      marker.style.left = `${(position.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng) * 100}%`;
      marker.style.top = `${(mercatorY(bounds.maxLat) - mercatorY(position.lat)) / (mercatorY(bounds.maxLat) - mercatorY(bounds.minLat)) * 100}%`;
      marker.textContent = placeNames[placeId].slice(0, 1);
      marker.addEventListener("click", () => {
        renderTravelPhotos(placeId);
        travelAlbum.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      markers.append(marker);
    });
  });

  // Separate nearby icons while keeping a thin line to each geographic anchor.
  function layoutTravelMarkers(stage) {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    const links = stage.querySelector(".travel-marker-links");
    links.setAttribute("viewBox", `0 0 ${width} ${height}`);
    links.replaceChildren();
    const placed = [];
    const offsets = [[0, 0]];
    [29, 41, 55, 70, 86].forEach((radius) => {
      for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6;
        offsets.push([Math.round(Math.cos(angle) * radius), Math.round(Math.sin(angle) * radius)]);
      }
    });
    stage.querySelectorAll(".travel-marker").forEach((marker) => {
      const anchorX = parseFloat(marker.style.left) * width / 100;
      const anchorY = parseFloat(marker.style.top) * height / 100;
      const choice = offsets.find(([dx, dy]) => {
        const x = anchorX + dx;
        const y = anchorY + dy;
        return x >= 15 && x <= width - 15 && y >= 15 && y <= height - 15
          && placed.every(([otherX, otherY]) => Math.hypot(x - otherX, y - otherY) >= 29);
      }) || [0, 0];
      const [dx, dy] = choice;
      marker.style.setProperty("--marker-shift-x", `${dx}px`);
      marker.style.setProperty("--marker-shift-y", `${dy}px`);
      placed.push([anchorX + dx, anchorY + dy]);
      if (dx || dy) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", anchorX);
        line.setAttribute("y1", anchorY);
        line.setAttribute("x2", anchorX + dx);
        line.setAttribute("y2", anchorY + dy);
        links.append(line);
        const anchor = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        anchor.setAttribute("cx", anchorX);
        anchor.setAttribute("cy", anchorY);
        anchor.setAttribute("r", "2.5");
        links.append(anchor);
      }
    });
  }
  travelMapStages.forEach(layoutTravelMarkers);
  let travelLayoutFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(travelLayoutFrame);
    travelLayoutFrame = requestAnimationFrame(() => travelMapStages.forEach(layoutTravelMarkers));
  });

  placeGroups.forEach((photos, placeId) => {
    const button = document.createElement("button");
    button.className = "travel-place";
    button.type = "button";
    button.dataset.travelPlace = placeId;
    button.setAttribute("aria-pressed", "false");
    button.textContent = `${placeNames[placeId]} ${photos.length}`;
    button.addEventListener("click", () => renderTravelPhotos(placeId));
    travelPlacesNode.append(button);
  });
  renderTravelPhotos("all");

  const chinaViewport = document.querySelector(".travel-map-stage--china")?.parentElement;
  if (chinaViewport && chinaViewport.scrollWidth > chinaViewport.clientWidth) {
    chinaViewport.scrollLeft = (chinaViewport.scrollWidth - chinaViewport.clientWidth) * 0.65;
  }

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
