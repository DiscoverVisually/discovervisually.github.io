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

(function initHeroBookFocus() {
  const books = [...document.querySelectorAll(".hero-book[data-amazon]")];
  const card = document.querySelector("[data-book-focus-card]");
  const scrim = document.querySelector("[data-book-focus-scrim]");
  const coverLink = document.querySelector("[data-book-focus-cover]");
  const focusImage = document.querySelector("[data-book-focus-image]");
  const amazonLink = document.querySelector("[data-book-focus-amazon]");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!books.length || !card || !scrim || !coverLink || !focusImage || !amazonLink || reduced.matches) return;

  let activeBook = null;
  let activationMode = "pointer";
  let sourceFrame = null;
  let targetFrame = null;
  let openTimer = 0;
  let arrivalTimer = 0;
  let closeTimer = 0;
  let engagedCard = false;
  let focusAmazonOnArrival = false;
  let returning = false;

  function setFrame(frame) {
    card.style.left = `${frame.left}px`;
    card.style.top = `${frame.top}px`;
    card.style.width = `${frame.width}px`;
    card.style.height = `${frame.height}px`;
  }

  function getTargetFrame(origin) {
    const aspect = origin.width / origin.height;
    const maxBookHeight = window.innerHeight * .8;
    const maxBookWidth = window.innerWidth * .54;
    const height = Math.min(maxBookHeight, maxBookWidth / aspect);
    const width = height * aspect;
    const buttonRoom = 72;
    return {
      width,
      height,
      left: (window.innerWidth - width) / 2,
      top: Math.max(20, (window.innerHeight - height - buttonRoom) / 2)
    };
  }

  function clearTimers() {
    window.clearTimeout(openTimer);
    window.clearTimeout(arrivalTimer);
    window.clearTimeout(closeTimer);
  }

  function openBook(book, mode = "pointer") {
    if (!book || returning || activeBook) return;

    clearTimers();
    activeBook = book;
    activationMode = mode;
    engagedCard = false;
    sourceFrame = book.getBoundingClientRect();
    targetFrame = getTargetFrame(sourceFrame);

    const sourceImage = book.querySelector("img");
    focusImage.src = sourceImage.currentSrc || sourceImage.src;
    focusImage.alt = sourceImage.alt;
    coverLink.href = book.href;
    coverLink.setAttribute("aria-label", book.getAttribute("aria-label") || `Explore ${book.dataset.bookTitle}`);
    amazonLink.href = book.dataset.amazon;
    amazonLink.setAttribute("aria-label", `See ${book.dataset.bookTitle} on Amazon (opens in a new tab)`);

    card.classList.remove("is-returning", "is-arrived");
    card.setAttribute("aria-hidden", "false");
    scrim.setAttribute("aria-hidden", "false");
    setFrame(sourceFrame);
    card.classList.add("is-visible");
    book.classList.add("is-focus-source");

    requestAnimationFrame(() => requestAnimationFrame(() => {
      scrim.classList.add("is-visible");
      setFrame(targetFrame);
    }));

    arrivalTimer = window.setTimeout(() => {
      if (activeBook !== book || returning) return;
      card.classList.add("is-arrived");
      amazonLink.tabIndex = 0;
      if (focusAmazonOnArrival) {
        focusAmazonOnArrival = false;
        amazonLink.focus({ preventScroll: true });
      }
    }, 790);
  }

  function finishClose() {
    if (activeBook) activeBook.classList.remove("is-focus-source");
    activeBook = null;
    sourceFrame = null;
    targetFrame = null;
    engagedCard = false;
    focusAmazonOnArrival = false;
    returning = false;
    card.classList.remove("is-visible", "is-returning", "is-arrived");
    card.setAttribute("aria-hidden", "true");
    scrim.setAttribute("aria-hidden", "true");
    amazonLink.tabIndex = -1;
    focusImage.src = "";
  }

  function closeBook({ restoreFocus = false, immediate = false } = {}) {
    if (!activeBook || returning) return;
    const bookToRestore = activeBook;
    clearTimers();
    returning = true;
    card.classList.remove("is-arrived");
    amazonLink.tabIndex = -1;
    scrim.classList.remove("is-visible");

    if (immediate || !bookToRestore.isConnected) {
      finishClose();
    } else {
      card.classList.add("is-returning");
      setFrame(bookToRestore.getBoundingClientRect());
      window.setTimeout(finishClose, 610);
    }

    if (restoreFocus) bookToRestore.focus({ preventScroll: true });
  }

  function inside(rect, x, y, margin = 0, bottomExtra = margin) {
    return x >= rect.left - margin && x <= rect.left + rect.width + margin && y >= rect.top - margin && y <= rect.top + rect.height + bottomExtra;
  }

  function pointerIsInFocusZone(x, y) {
    if (!sourceFrame || !targetFrame) return false;
    if (engagedCard) return inside(targetFrame, x, y, 48, 104);
    const left = Math.min(sourceFrame.left, targetFrame.left) - 42;
    const right = Math.max(sourceFrame.right, targetFrame.left + targetFrame.width) + 42;
    const top = Math.min(sourceFrame.top, targetFrame.top) - 42;
    const bottom = Math.max(sourceFrame.bottom, targetFrame.top + targetFrame.height + 82) + 42;
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  books.forEach((book) => {
    book.addEventListener("pointerenter", () => {
      if (!canHover.matches || activeBook || returning) return;
      window.clearTimeout(openTimer);
      openTimer = window.setTimeout(() => openBook(book, "pointer"), 150);
    });

    book.addEventListener("pointerleave", () => {
      if (!activeBook) window.clearTimeout(openTimer);
    });

    book.addEventListener("focus", () => { if (canHover.matches) openBook(book, "keyboard"); });
    book.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeBook === book) {
        event.preventDefault();
        closeBook({ restoreFocus: true });
      }
      if (event.key === "Tab" && !event.shiftKey && activeBook === book) {
        event.preventDefault();
        if (card.classList.contains("is-arrived")) amazonLink.focus({ preventScroll: true });
        else focusAmazonOnArrival = true;
      }
    });
    book.addEventListener("blur", (event) => {
      if (activationMode === "keyboard" && activeBook === book && event.relatedTarget !== amazonLink) closeBook({ immediate: true });
    });
  });

  card.addEventListener("pointerenter", () => {
    if (card.classList.contains("is-arrived")) engagedCard = true;
  });
  amazonLink.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeBook({ restoreFocus: true });
    }
  });
  amazonLink.addEventListener("blur", (event) => {
    if (activationMode === "keyboard" && activeBook && event.relatedTarget !== activeBook) closeBook();
  });

  document.addEventListener("pointermove", (event) => {
    if (!activeBook || returning || activationMode !== "pointer" || !card.classList.contains("is-arrived")) return;
    window.clearTimeout(closeTimer);
    if (!pointerIsInFocusZone(event.clientX, event.clientY)) closeTimer = window.setTimeout(() => closeBook(), 90);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeBook) closeBook({ restoreFocus: activationMode === "keyboard" });
  });
  window.addEventListener("scroll", () => closeBook({ immediate: true }), { passive: true });
  window.addEventListener("resize", () => closeBook({ immediate: true }));
})();

(function initHeroParallax() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let frame = 0;

  function resetDepth() {
    ["--stage-x","--stage-y","--archive-x","--archive-y","--archive-front-x","--archive-front-y","--smoke-main-x","--smoke-main-y","--smoke-warm-x","--smoke-warm-y","--haze-x","--haze-y"].forEach((name) => hero.style.setProperty(name, "0px"));
  }

  function applyPointer(clientX, clientY) {
    const rect = hero.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width - .5) * 2));
    const ny = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height - .5) * 2));

    hero.style.setProperty("--stage-x", `${(nx * 6).toFixed(2)}px`);
    hero.style.setProperty("--stage-y", `${(ny * 4).toFixed(2)}px`);
    hero.style.setProperty("--archive-x", `${(nx * 3).toFixed(2)}px`);
    hero.style.setProperty("--archive-y", `${(ny * 2).toFixed(2)}px`);
    hero.style.setProperty("--archive-front-x", `${(nx * -5).toFixed(2)}px`);
    hero.style.setProperty("--archive-front-y", `${(ny * -3).toFixed(2)}px`);
    hero.style.setProperty("--smoke-main-x", `${(nx * 12).toFixed(2)}px`);
    hero.style.setProperty("--smoke-main-y", `${(ny * 8).toFixed(2)}px`);
    hero.style.setProperty("--smoke-warm-x", `${(nx * -18).toFixed(2)}px`);
    hero.style.setProperty("--smoke-warm-y", `${(ny * -11).toFixed(2)}px`);
    hero.style.setProperty("--haze-x", `${(nx * 7).toFixed(2)}px`);
    hero.style.setProperty("--haze-y", `${(ny * 4).toFixed(2)}px`);
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
    hero.style.setProperty("--stage-scroll", `${(-progress * 14).toFixed(2)}px`);
    hero.style.setProperty("--archive-scroll", `${(-progress * 8).toFixed(2)}px`);
    hero.style.setProperty("--smoke-scroll", `${(-progress * 22).toFixed(2)}px`);
  }

  updateScroll();
  window.addEventListener("scroll", updateScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      hero.classList.toggle("hero-paused", !entry.isIntersecting);
    }, { threshold: 0.01 });
    observer.observe(hero);
  }
})();
