(() => {
  const hero = document.querySelector(".pm-hero");
  const heroBook = document.querySelector(".pm-hero-book");
  const stage = document.querySelector(".pm-hero-stage");

  if (stage) {
    stage.addEventListener("pointermove", (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      stage.style.setProperty("--pm-x", x.toFixed(3));
      stage.style.setProperty("--pm-y", y.toFixed(3));
    });
    stage.addEventListener("pointerleave", () => {
      stage.style.setProperty("--pm-x", "0");
      stage.style.setProperty("--pm-y", "0");
    });
  }

  if (hero && heroBook) {
    const setHover = (active) =>
      hero.classList.toggle("is-book-hovered", active);
    heroBook.addEventListener("pointerenter", () => setHover(true));
    heroBook.addEventListener("pointerleave", () => setHover(false));
    heroBook.addEventListener("focusin", () => setHover(true));
    heroBook.addEventListener("focusout", () => setHover(false));
  }

  const inside = document.querySelector(".pm-inside");
  const shell = document.querySelector(".pm-open-book-shell");
  const book = document.querySelector(".pm-open-book");
  const artImage = document.querySelector(".pm-spread-art img");
  if (!inside || !shell || !book || !artImage) return;

  const spreads = [
    {
      src: "../assets/pompeii-interior-street.webp",
      alt: "A Day in Pompeii — an immersive street-level view of the living Roman city",
      description:
        "Experience ancient Pompeii through the first-person view of a time traveller.",
    },
    {
      src: "../assets/pompeii-interior-home.webp",
      alt: "Inside a Roman Home — an illustrated cutaway infographic",
      description:
        "Explore an infographic cutaway of a Roman home—from its rain-catching atrium to the rooms where a family lived.",
    },
    {
      src: "../assets/pompeii-interior-food.webp",
      alt: "Ancient Fast Food — daily life at a Pompeii thermopolium",
      description:
        "Discover how people really lived in the city, from everyday food and busy counters to the rhythm of a Pompeian street.",
    },
    {
      src: "../assets/pompeii-interior-eruption.webp",
      alt: "The eruption of Mount Vesuvius visualized above Pompeii",
      description:
        "Witness Vesuvius erupt through cinematic visualizations grounded in real eyewitness accounts and volcanic science.",
    },
    {
      src: "../assets/pompeii-interior-archaeology.webp",
      alt: "The rediscovery and archaeology of the buried city of Pompeii",
      description:
        "Follow the aftermath—from the buried city to archaeology, rediscovery and everything Pompeii still teaches us today.",
    },
  ];

  const counter = document.querySelector(".pm-spread-controls > span");
  const description = document.querySelector(".pm-spread-controls > p");
  const dots = Array.from(
    document.querySelectorAll(".pm-spread-controls button"),
  );
  let active = 0;
  let openProgress = 0;
  let hasOpened = false;

  const showSpread = (index) => {
    active = (index + spreads.length) % spreads.length;
    const spread = spreads[active];
    book.classList.remove("pm-flipping");
    void book.offsetWidth;
    book.classList.add("pm-flipping");
    artImage.src = spread.src;
    artImage.alt = spread.alt;
    if (counter)
      counter.textContent = `${String(active + 1).padStart(2, "0")} / ${String(spreads.length).padStart(2, "0")}`;
    if (description) description.textContent = spread.description;
    dots.forEach((dot, i) =>
      i === active
        ? dot.setAttribute("aria-current", "true")
        : dot.removeAttribute("aria-current"),
    );
  };

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setProgress = (value) => {
    openProgress = Math.min(1, Math.max(0, value));
    if (reducedMotion() && openProgress > 0.01) openProgress = 1;
    inside.style.setProperty("--pm-open-progress", openProgress.toFixed(4));
    inside.classList.toggle("has-visible-pages", openProgress > 0.015);
  };

  const openBook = () => {
    if (hasOpened) return;
    hasOpened = true;
    inside.classList.add("is-opening");

    if (reducedMotion()) {
      setProgress(1);
      inside.classList.add("is-open");
      return;
    }

    const startedAt = performance.now();
    const duration = 1750;
    const animate = (now) => {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 4);
      setProgress(eased);
      if (elapsed < 1) {
        requestAnimationFrame(animate);
      } else {
        inside.classList.remove("is-opening");
        inside.classList.add("is-open");
      }
    };
    requestAnimationFrame(animate);
  };

  document
    .querySelector(".pm-prev")
    ?.addEventListener("click", () => showSpread(active - 1));
  document
    .querySelector(".pm-next")
    ?.addEventListener("click", () => showSpread(active + 1));
  dots.forEach((dot, index) =>
    dot.addEventListener("click", () => showSpread(index)),
  );
  const openingObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && entry.intersectionRatio >= 0.52) {
        openBook();
        openingObserver.disconnect();
      }
    },
    { threshold: [0, 0.25, 0.52, 0.75, 1] },
  );

  openingObserver.observe(inside);
  showSpread(0);
  setProgress(0);
})();
