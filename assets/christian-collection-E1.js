(() => {
  const menuButton = document.querySelector(".menu-button");
  const menu = document.querySelector("#collection-nav");

  const setMenu = (open) => {
    if (!menuButton || !menu) return;
    menu.classList.toggle("nav-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  };

  menuButton?.addEventListener("click", () => {
    setMenu(!menu?.classList.contains("nav-open"));
  });
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const stage = document.querySelector("[data-spotlight-stage]");
  const books = [...document.querySelectorAll("[data-open-book]")];

  const setOpen = (book, open) => {
    book.classList.toggle("is-open", open);
    book.closest(".spotlight-book")?.classList.toggle("is-active", open);
    stage?.classList.toggle("has-active", books.some((item) => item.classList.contains("is-open")));
  };

  books.forEach((book) => {
    let timer;
    book.addEventListener("pointerenter", () => {
      if (!finePointer.matches) return;
      clearTimeout(timer);
      books.forEach((item) => setOpen(item, item === book));
    });
    book.addEventListener("pointerleave", () => {
      if (!finePointer.matches) return;
      timer = setTimeout(() => setOpen(book, false), 130);
    });
    book.addEventListener("focus", () => {
      books.forEach((item) => setOpen(item, item === book));
    });
    book.addEventListener("blur", () => setOpen(book, false));
  });

  if (!reducedMotion.matches) {
    const hero = document.querySelector(".collection-hero");
    hero?.addEventListener("pointermove", (event) => {
      if (!finePointer.matches) return;
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
      hero.style.setProperty("--my", ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
    }, { passive: true });
  }
})();
