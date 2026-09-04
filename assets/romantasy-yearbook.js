(() => {
  const slides = [
    {
      src: "/assets/romantasy-interior-contents.webp",
      title: "Inside the yearbook",
      description: "A guided map from the genre’s roots to the BookTok boom, trope engine and reader paths.",
      alt: "Table of contents showing the five-part structure of The Ultimate Romantasy Yearbook"
    },
    {
      src: "/assets/romantasy-interior-roots.webp",
      title: "Where the obsession began",
      description: "The paranormal romance roots that turned supernatural love stories into shared fandom rituals.",
      alt: "Visual timeline spread about the paranormal romance roots of modern Romantasy"
    },
    {
      src: "/assets/romantasy-interior-fae-courts.webp",
      title: "The fae court door opens",
      description: "A visual breakdown of the courtly danger, bargains and immortal rules that reshaped fantasy romance.",
      alt: "Illustrated spread explaining the rise of fae courts in modern Romantasy"
    },
    {
      src: "/assets/romantasy-interior-witches.webp",
      title: "Witches meet forced proximity",
      description: "Trope DNA, reader desire and the genre shifts that turn ideological conflict into romantic tension.",
      alt: "Illustrated spread about witches, forced proximity and Romantasy trope combinations"
    },
    {
      src: "/assets/romantasy-interior-dragons.webp",
      title: "War colleges and dragon bonds",
      description: "Why academy structure, bonded creatures, deadly trials and sequel urgency became a BookTok engine.",
      alt: "Illustrated spread mapping dragon academies, reader appetite and BookTok reading cycles"
    }
  ];

  const viewer = document.querySelector("[data-spread-viewer]");
  const stage = viewer?.querySelector(".ry-viewer-stage");
  const image = viewer?.querySelector("[data-spread-image]");
  const count = viewer?.querySelector("[data-spread-count]");
  const title = viewer?.querySelector("[data-spread-title]");
  const description = viewer?.querySelector("[data-spread-description]");
  const tabs = [...document.querySelectorAll("[data-spread-tab]")];
  const dialog = document.querySelector("[data-spread-dialog]");
  const dialogImage = dialog?.querySelector("[data-dialog-image]");
  let active = 0;
  let swapTimer = 0;

  function showSlide(index) {
    if (!stage || !image || !count || !title || !description) return;
    active = (index + slides.length) % slides.length;
    const slide = slides[active];
    window.clearTimeout(swapTimer);
    stage.classList.add("is-changing");
    swapTimer = window.setTimeout(() => {
      image.src = slide.src;
      image.alt = slide.alt;
      count.textContent = `${String(active + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      title.textContent = slide.title;
      description.textContent = slide.description;
      tabs.forEach((tab, indexValue) => tab.setAttribute("aria-selected", String(indexValue === active)));
      stage.classList.remove("is-changing");
    }, 150);
  }

  viewer?.querySelector("[data-spread-prev]")?.addEventListener("click", () => showSlide(active - 1));
  viewer?.querySelector("[data-spread-next]")?.addEventListener("click", () => showSlide(active + 1));
  tabs.forEach((tab) => tab.addEventListener("click", () => showSlide(Number(tab.dataset.spreadTab))));
  viewer?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(active - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(active + 1);
    }
  });

  viewer?.querySelector("[data-spread-expand]")?.addEventListener("click", () => {
    if (!dialog || !dialogImage) return;
    dialogImage.src = slides[active].src;
    dialogImage.alt = slides[active].alt;
    dialog.showModal();
  });
  dialog?.querySelector("[data-spread-close]")?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  const cover = document.querySelector("[data-cover-stage]");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (cover && finePointer.matches && !reducedMotion.matches) {
    cover.addEventListener("pointermove", (event) => {
      const rect = cover.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
      cover.style.setProperty("--ry-tilt-x", x.toFixed(3));
      cover.style.setProperty("--ry-tilt-y", y.toFixed(3));
    });
    cover.addEventListener("pointerleave", () => {
      cover.style.setProperty("--ry-tilt-x", "0");
      cover.style.setProperty("--ry-tilt-y", "0");
    });
  }
})();
