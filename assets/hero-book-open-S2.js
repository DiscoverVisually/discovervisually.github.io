(() => {
  const spreads = {
    "cover-pompeii": {
      src: "/assets/spread-pompeii.webp",
      alt: "Interior spread from Pompeii: The Last Day showing the eruption of Vesuvius"
    },
    "cover-women": {
      src: "/assets/spread-women-of-the-bible.webp",
      alt: "Interior spread from Women of the Bible for Today featuring Ruth"
    },
    "cover-romantasy": {
      src: "/assets/spread-romantasy-yearbook.webp",
      alt: "Interior spread from The Ultimate Romantasy Yearbook about war colleges and dragon bonds"
    }
  };

  const coarsePointer = matchMedia("(hover: none), (pointer: coarse)");
  const heroBooks = [...document.querySelectorAll(".hero .float-book")];
  if (!heroBooks.length) return;

  const closeBooks = (except = null) => {
    heroBooks.forEach((book) => {
      if (book === except) return;
      book.classList.remove("is-open");
      book.setAttribute("aria-expanded", "false");
    });
  };

  heroBooks.forEach((book) => {
    const key = Object.keys(spreads).find((className) => book.classList.contains(className));
    const cover = book.querySelector(":scope > img");
    if (!key || !cover || book.dataset.openBookReady) return;

    book.dataset.openBookReady = "true";
    book.classList.add("dv-openable");
    book.setAttribute("aria-expanded", "false");

    const spread = document.createElement("span");
    spread.className = "hero-book-spread";
    spread.setAttribute("aria-hidden", "true");
    spread.innerHTML = `<img src="${spreads[key].src}" alt="${spreads[key].alt}" loading="lazy" decoding="async">`;

    const lid = document.createElement("span");
    lid.className = "hero-cover-lid";
    lid.setAttribute("aria-hidden", "true");
    const back = document.createElement("span");
    back.className = "hero-cover-back";
    lid.append(back, cover);

    book.prepend(spread);
    book.append(lid);

    book.addEventListener("click", (event) => {
      if (!coarsePointer.matches) return;
      if (!book.classList.contains("is-open")) {
        event.preventDefault();
        closeBooks(book);
        book.classList.add("is-open");
        book.setAttribute("aria-expanded", "true");
      }
    });

    book.addEventListener("focus", () => {
      if (coarsePointer.matches) return;
      closeBooks(book);
      book.classList.add("is-open");
      book.setAttribute("aria-expanded", "true");
    });

    book.addEventListener("blur", () => {
      if (coarsePointer.matches) return;
      book.classList.remove("is-open");
      book.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!coarsePointer.matches || event.target.closest(".hero .float-book")) return;
    closeBooks();
  }, { passive: true });

  const hint = document.querySelector(".mobile-tap-hint");
  if (hint) hint.textContent = "Tap to look inside · tap again to explore";

  const warmSpreads = () => {
    Object.values(spreads).forEach(({ src }) => {
      const image = new Image();
      image.src = src;
    });
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(warmSpreads, { timeout: 2200 });
  } else {
    setTimeout(warmSpreads, 1400);
  }

  const loadPolishLayer = () => {
    if (!document.querySelector('link[data-dv-polish]')) {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "/assets/polish-conversion-P1.css?v=20260723";
      style.dataset.dvPolish = "true";
      document.head.appendChild(style);
    }
    if (!document.querySelector('script[data-dv-polish]')) {
      const script = document.createElement("script");
      script.src = "/assets/polish-conversion-P1.js?v=20260723";
      script.defer = true;
      script.dataset.dvPolish = "true";
      document.body.appendChild(script);
    }
  };
  loadPolishLayer();
})();
