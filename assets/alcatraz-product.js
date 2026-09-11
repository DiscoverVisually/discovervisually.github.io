(() => {
  const slides = [
    {
      src: "../assets/alcatraz-interior-map.webp",
      title: "Two Alcatrazes",
      description: "Start with the island itself: its buildings, routines and security layers are the first clues in the case.",
      alt: "Investigation file spread explaining the two Alcatrazes: the island and the prison, with a map and an illustrated guide."
    },
    {
      src: "../assets/alcatraz-interior-wall.webp",
      title: "A weak spot in the wall",
      description: "Cutaways make the prison legible, showing how a cell, a rear wall and a hidden service space could connect.",
      alt: "Illustrated Alcatraz cutaway showing a prison cell, rear wall and hidden service space."
    },
    {
      src: "../assets/alcatraz-interior-feeding.webp",
      title: "Feeding the Rock",
      description: "Follow the food, work and movement systems that kept an island prison running every day.",
      alt: "Infographic spread mapping food, kitchen, dining and supply movement through Alcatraz prison."
    },
    {
      src: "../assets/alcatraz-interior-escape.webp",
      title: "The last wall",
      description: "Reconstruct the route beyond the cells, then weigh the evidence about what happened in the bay.",
      alt: "Night escape spread showing Alcatraz, the bay and the final wall between the island and freedom."
    }
  ];

  const viewer = document.querySelector("[data-az-viewer]");
  const stage = viewer?.querySelector(".az-viewer-stage");
  const image = viewer?.querySelector("[data-az-spread-image]");
  const count = viewer?.querySelector("[data-az-spread-count]");
  const title = viewer?.querySelector("[data-az-spread-title]");
  const description = viewer?.querySelector("[data-az-spread-description]");
  const tabs = [...document.querySelectorAll("[data-az-spread-tab]")];
  const previous = viewer?.querySelector("[data-az-spread-prev]");
  const next = viewer?.querySelector("[data-az-spread-next]");
  const dialog = document.querySelector("[data-az-spread-dialog]");
  const dialogImage = dialog?.querySelector("[data-az-dialog-image]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let active = 0;
  let swapTimer = 0;
  let pointerStart = null;

  const preload = (index) => {
    const slide = slides[index];
    if (!slide) return;
    const image = new Image();
    image.decoding = "async";
    image.src = slide.src;
  };

  const update = (index) => {
    const slide = slides[index];
    if (!slide || !image || !count || !title || !description) return;
    image.src = slide.src;
    image.alt = slide.alt;
    count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    title.textContent = slide.title;
    description.textContent = slide.description;
    tabs.forEach((tab, tabIndex) => {
      tab.setAttribute("aria-selected", String(tabIndex === index));
    });
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
    preload(index - 1);
    preload(index + 1);
  };

  const showSlide = (requestedIndex) => {
    if (!stage || !image) return;
    const nextIndex = Math.max(0, Math.min(slides.length - 1, requestedIndex));
    if (nextIndex === active) return;
    active = nextIndex;
    window.clearTimeout(swapTimer);
    if (reducedMotion.matches) {
      update(active);
      return;
    }
    stage.classList.add("is-changing");
    swapTimer = window.setTimeout(() => {
      update(active);
      stage.classList.remove("is-changing");
    }, 170);
  };

  previous?.addEventListener("click", () => showSlide(active - 1));
  next?.addEventListener("click", () => showSlide(active + 1));
  tabs.forEach((tab) => tab.addEventListener("click", () => showSlide(Number(tab.dataset.azSpreadTab))));

  viewer?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(active + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      showSlide(0);
    } else if (event.key === "End") {
      event.preventDefault();
      showSlide(slides.length - 1);
    }
  });

  stage?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart = { x: event.clientX, y: event.clientY };
    stage.setPointerCapture?.(event.pointerId);
  });
  stage?.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.2) showSlide(active + (dx < 0 ? 1 : -1));
  });
  stage?.addEventListener("pointercancel", () => { pointerStart = null; });

  viewer?.querySelector("[data-az-spread-expand]")?.addEventListener("click", () => {
    if (!dialog || !dialogImage) return;
    dialogImage.src = slides[active].src;
    dialogImage.alt = slides[active].alt;
    dialog.showModal();
  });
  dialog?.querySelector("[data-az-spread-close]")?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(active - 1);
      if (dialogImage) dialogImage.src = slides[active].src;
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(active + 1);
      if (dialogImage) dialogImage.src = slides[active].src;
    }
  });

  const cover = document.querySelector("[data-az-cover-stage]");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (cover && finePointer.matches && !reducedMotion.matches) {
    cover.addEventListener("pointermove", (event) => {
      const rect = cover.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
      cover.style.setProperty("--az-tilt-x", x.toFixed(3));
      cover.style.setProperty("--az-tilt-y", y.toFixed(3));
    });
    cover.addEventListener("pointerleave", () => {
      cover.style.setProperty("--az-tilt-x", "0");
      cover.style.setProperty("--az-tilt-y", "0");
    });
  }

  const progress = document.querySelector("[data-az-progress]");
  let ticking = false;
  const updateProgress = () => {
    ticking = false;
    if (!progress) return;
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.width = `${Math.min(1, Math.max(0, window.scrollY / total)) * 100}%`;
  };
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });

  update(0);
  slides.forEach((_, index) => preload(index));
  updateProgress();
})();
