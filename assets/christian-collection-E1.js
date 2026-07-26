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
  const verdictTrigger = document.querySelector(".verdict-trigger");
  const verdict = document.querySelector("#verdict-one");
  const heroVolumes = [...document.querySelectorAll(".hero-volume")];

  verdictTrigger?.addEventListener("click", () => {
    const open = verdictTrigger.getAttribute("aria-expanded") !== "true";
    verdictTrigger.setAttribute("aria-expanded", String(open));
    if (verdict) verdict.hidden = !open;
  });

  heroVolumes.forEach((book) => {
    book.addEventListener("click", (event) => {
      if (finePointer.matches || book.classList.contains("is-open")) return;
      event.preventDefault();
      heroVolumes.forEach((volume) => volume.classList.toggle("is-open", volume === book));
    });
  });
  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".hero-volume")) return;
    heroVolumes.forEach((book) => book.classList.remove("is-open"));
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
