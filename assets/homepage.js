const heroFixStylesheet = document.createElement("link");
heroFixStylesheet.rel = "stylesheet";
heroFixStylesheet.href = "/assets/homepage-hero-fixpass.css?v=20260904fixpass1";
document.head.appendChild(heroFixStylesheet);

const featuredBooks = [
  {
    key: "lincoln",
    title: "I Worked for Abraham Lincoln",
    shortTitle: "Abraham Lincoln",
    url: "/books/i-worked-for-abraham-lincoln.html",
    cover: "/books/lincoln-cover.webp",
    amazon: "https://www.amazon.com/dp/B0HHJYQD5P",
    audience: "Ages 8+",
    meta: "82 full-color pages · Civil War history",
    kicker: "Civil War history · Ages 8+",
    spotlightTitle: "The Civil War, seen from inside the White House.",
    spread: "/assets/lincoln-interior-gettysburg.webp"
  },
  {
    key: "hindenburg",
    title: "Hindenburg: The Final Flight",
    shortTitle: "Hindenburg",
    url: "/books/hindenburg-the-final-flight.html",
    cover: "/books/hindenburg-cover.webp",
    amazon: "https://www.amazon.com/dp/B0HH7K5L5L",
    audience: "Ages 10+",
    meta: "80 full-color pages · Aviation history",
    kicker: "Aviation history · Ages 10+",
    spotlightTitle: "Cross the Atlantic—then follow the disaster second by second.",
    spread: "/assets/hindenburg-interior-fire.webp"
  },
  {
    key: "pompeii",
    title: "Pompeii: The Last Day",
    shortTitle: "Pompeii",
    url: "/books/pompeii-the-last-day.html",
    cover: "/books/pompeii-cover.webp",
    amazon: "https://www.amazon.com/dp/B0H6NMNL53",
    audience: "Ages 8–12",
    meta: "72 full-color pages · Ancient history",
    kicker: "Ancient history · Ages 8–12",
    spotlightTitle: "The ancient world, made immediate.",
    spread: "/assets/spread-pompeii.webp"
  }
];

function applyHomepageFocus() {
  const navPanel = document.querySelector(".nav-explore-panel");
  if (navPanel) {
    navPanel.innerHTML = `<div><small>Browse</small><a href="/collections/children/">For Children</a><a href="/collections/history/">History</a><a href="/collections/visual-learning/">Visual Learning</a><a href="/collections/">All collections</a></div><div><small>History Hunters</small><a href="/books/pompeii-the-last-day.html">Pompeii</a><a href="/books/hindenburg-the-final-flight.html">Hindenburg</a><a href="/books/i-worked-for-abraham-lincoln.html">Abraham Lincoln</a></div>`;
  }

  const intro = document.querySelector(".hero-intro");
  if (intro) intro.textContent = "Immersive visual history books that turn real events into worlds young readers can enter.";

  const readersTitle = document.querySelector("#readers-title");
  if (readersTitle) readersTitle.innerHTML = "Three ways in.<br><em>One visual shelf.</em>";
  const readersCopy = document.querySelector(".catalogue-intro-copy");
  if (readersCopy) readersCopy.textContent = "Browse the same three History Hunters books by reader, subject or learning style.";

  const readerGrid = document.querySelector("#reader-cards");
  if (readerGrid) {
    readerGrid.innerHTML = `
      <a class="reader-card reader-children" href="/collections/children/"><span class="reader-art" aria-hidden="true"></span><span class="reader-number">01</span><span class="reader-copy"><small>For Children</small><strong>Curiosity set free</strong></span><span class="reader-action">Explore the collection <b>↗</b></span></a>
      <a class="reader-card reader-history" href="/collections/history/"><span class="reader-art" aria-hidden="true"></span><span class="reader-number">02</span><span class="reader-copy"><small>History</small><strong>The past made immediate</strong></span><span class="reader-action">Explore history <b>↗</b></span></a>
      <a class="reader-card reader-educational" href="/collections/visual-learning/"><span class="reader-art" aria-hidden="true"></span><span class="reader-number">03</span><span class="reader-copy"><small>Visual Learning</small><strong>Ideas made visible</strong></span><span class="reader-action">Explore visual learning <b>↗</b></span></a>`;
  }

  const catalogIntro = document.querySelector(".catalog-intro > p");
  if (catalogIntro) catalogIntro.textContent = "Three immersive History Hunters books—each designed to make a real historical world feel understandable, immediate and worth exploring.";
  const catalogGrid = document.querySelector(".catalog-grid");
  if (catalogGrid) {
    catalogGrid.innerHTML = featuredBooks.map((book) => `<article class="catalog-card"><a class="catalog-cover" href="${book.url}" aria-label="Explore ${book.title}"><img src="${book.cover}" alt="${book.title} book cover" loading="lazy"><span class="status status-available">Available now</span></a><div class="catalog-meta"><p>History Hunters · ${book.audience}</p><h3>${book.title}</h3><span>${book.meta}</span><div class="card-actions"><a href="${book.url}">Look inside</a><a class="amazon-link" href="${book.amazon}" target="_blank" rel="noopener noreferrer">View on Amazon <b>↗</b></a></div></div></article>`).join("");
  }

  const spotlightTabs = document.querySelector(".spotlight-tabs");
  if (spotlightTabs) {
    spotlightTabs.innerHTML = featuredBooks.map((book, index) => `<button type="button" role="tab" aria-selected="${index === 0}" aria-controls="spotlight-panel" id="spotlight-tab-${book.key}" ${index ? 'tabindex="-1"' : ""} data-spotlight="${book.key}"><span>0${index + 1}</span><span><small>Available now</small>${book.title}</span></button>`).join("");
  }

  const footerNav = document.querySelector("footer nav[aria-label='Footer navigation']");
  if (footerNav) footerNav.innerHTML = `<a href="/books/">Books</a><a href="/collections/history/">History</a><a href="/collections/children/">For Children</a><a href="/collections/visual-learning/">Visual Learning</a><a href="/about/#approach">Our approach</a><a href="/about/">About the studio</a><a href="mailto:hello@discovervisually.com">Contact</a><a href="/privacy/">Privacy</a>`;

  const style = document.createElement("style");
  style.textContent = `.catalog-grid{grid-template-columns:repeat(3,minmax(0,1fr))}@media(max-width:1000px){.catalog-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.catalog-grid{grid-template-columns:1fr}}`;
  document.head.appendChild(style);
}

applyHomepageFocus();

const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-navigation]");

function closeMenu() {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  navigation.removeAttribute("data-open");
  document.body.classList.remove("menu-open");
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    if (isOpen) {
      navigation.removeAttribute("data-open");
      document.body.classList.remove("menu-open");
    } else {
      navigation.setAttribute("data-open", "true");
      document.body.classList.add("menu-open");
    }
  });
  navigation.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") { closeMenu(); menuButton.focus(); } });
  window.addEventListener("resize", () => { if (window.innerWidth > 800) closeMenu(); });
}

const navExplore = document.querySelector(".nav-explore");
document.addEventListener("click", (event) => { if (navExplore?.open && !navExplore.contains(event.target)) navExplore.open = false; });

const spotlightData = Object.fromEntries(featuredBooks.map((book) => [book.key, { image: book.spread, alt: `Interior spread from ${book.title}`, kicker: book.kicker, title: book.spotlightTitle, href: book.url }]));
const spotlightTabs = [...document.querySelectorAll("[data-spotlight]")];
const spotlightPanel = document.querySelector("#spotlight-panel");
const spotlightImage = document.querySelector("[data-spotlight-image]");
const spotlightKicker = document.querySelector("[data-spotlight-kicker]");
const spotlightTitle = document.querySelector("[data-spotlight-title]");
const spotlightLink = document.querySelector("[data-spotlight-link]");

function selectSpotlight(tab, shouldFocus = false) {
  const data = spotlightData[tab.dataset.spotlight];
  if (!data || !spotlightPanel || !spotlightImage || !spotlightKicker || !spotlightTitle || !spotlightLink) return;
  spotlightTabs.forEach((candidate) => { const active = candidate === tab; candidate.setAttribute("aria-selected", String(active)); candidate.tabIndex = active ? 0 : -1; });
  spotlightPanel.setAttribute("aria-labelledby", tab.id);
  spotlightImage.src = data.image;
  spotlightImage.alt = data.alt;
  spotlightKicker.textContent = data.kicker;
  spotlightTitle.textContent = data.title;
  spotlightLink.href = data.href;
  if (shouldFocus) tab.focus();
}

spotlightTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectSpotlight(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + spotlightTabs.length) % spotlightTabs.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % spotlightTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = spotlightTabs.length - 1;
    selectSpotlight(spotlightTabs[nextIndex], true);
  });
});
if (spotlightTabs[0]) selectSpotlight(spotlightTabs[0]);

(function initHeroParallax() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let frame = 0;

  function resetDepth() {
    ["--stage-x","--stage-y","--smoke-main-x","--smoke-main-y","--smoke-warm-x","--smoke-warm-y","--haze-x","--haze-y"].forEach((name) => hero.style.setProperty(name, "0px"));
  }

  function applyPointer(clientX, clientY) {
    const rect = hero.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width - .5) * 2));
    const ny = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height - .5) * 2));

    hero.style.setProperty("--stage-x", `${(nx * 6).toFixed(2)}px`);
    hero.style.setProperty("--stage-y", `${(ny * 4).toFixed(2)}px`);
    hero.style.setProperty("--smoke-main-x", `${(nx * 14).toFixed(2)}px`);
    hero.style.setProperty("--smoke-main-y", `${(ny * 9).toFixed(2)}px`);
    hero.style.setProperty("--smoke-warm-x", `${(nx * -22).toFixed(2)}px`);
    hero.style.setProperty("--smoke-warm-y", `${(ny * -13).toFixed(2)}px`);
    hero.style.setProperty("--haze-x", `${(nx * 7).toFixed(2)}px`);
    hero.style.setProperty("--haze-y", `${(ny * 5).toFixed(2)}px`);
  }

  if (finePointer.matches && !reduced.matches) {
    hero.addEventListener("pointermove", (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => applyPointer(event.clientX, event.clientY));
    }, { passive: true });
    hero.addEventListener("pointerleave", resetDepth);
  }

  function updateScroll() {
    if (reduced.matches) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
    hero.style.setProperty("--copy-scroll", `${(-progress * 8).toFixed(2)}px`);
    hero.style.setProperty("--stage-scroll", `${(-progress * 15).toFixed(2)}px`);
    hero.style.setProperty("--smoke-scroll", `${(-progress * 29).toFixed(2)}px`);
  }

  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });
})();
