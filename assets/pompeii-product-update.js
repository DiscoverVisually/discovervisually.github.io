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
  const leftPage = document.querySelector(".pm-book-page-left");
  const rightPage = document.querySelector(".pm-book-page-right");
  const leftImage = leftPage?.querySelector("img");
  const rightImage = rightPage?.querySelector("img");
  const turnSheet = document.querySelector(".pm-turn-sheet");
  const turnFront = turnSheet?.querySelector(".pm-turn-front img");
  const turnBack = turnSheet?.querySelector(".pm-turn-back img");

  if (
    !inside ||
    !shell ||
    !book ||
    !leftImage ||
    !rightImage ||
    !turnSheet ||
    !turnFront ||
    !turnBack
  )
    return;

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
  const chapterButtons = Array.from(
    document.querySelectorAll(".pm-chapter-nav button"),
  );
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let active = 0;
  let openProgress = 0;
  let hasOpened = false;
  let hasCelebratedGallery = false;
  let isTurning = false;
  let pointerStart = null;

  spreads.forEach(({ src }) => {
    const image = new Image();
    image.src = src;
  });

  const nudgeAmazon = () => {
    if (hasCelebratedGallery) return;
    hasCelebratedGallery = true;
    const targets = document.querySelectorAll(
      ".pm-header-amazon, .pm-desktop-buy, .pm-amazon-official",
    );
    targets.forEach((target) => target.classList.add("pm-cta-nudge"));
    window.setTimeout(
      () => targets.forEach((target) => target.classList.remove("pm-cta-nudge")),
      1800,
    );
  };

  const updateControls = (index) => {
    const spread = spreads[index];
    if (counter)
      counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(spreads.length).padStart(2, "0")}`;
    if (description) description.textContent = spread.description;
    chapterButtons.forEach((button, i) =>
      i === index
        ? button.setAttribute("aria-current", "true")
        : button.removeAttribute("aria-current"),
    );
    if (index === spreads.length - 1) nudgeAmazon();
  };

  const setBaseSpread = (index) => {
    const spread = spreads[index];
    leftImage.src = spread.src;
    leftImage.alt = spread.alt;
    rightImage.src = spread.src;
    rightImage.alt = "";
    active = index;
  };

  const showSpread = (requestedIndex) => {
    const nextIndex = (requestedIndex + spreads.length) % spreads.length;
    if (isTurning || nextIndex === active) return;

    const direction =
      (nextIndex > active && !(active === 0 && nextIndex === spreads.length - 1)) ||
      (active === spreads.length - 1 && nextIndex === 0)
        ? "forward"
        : "reverse";
    const current = spreads[active];
    const next = spreads[nextIndex];
    const duration = reducedMotion.matches ? 1 : 920;
    isTurning = true;
    shell.classList.add("is-turning");

    if (direction === "forward") {
      turnFront.src = current.src;
      turnBack.src = next.src;
      rightImage.src = next.src;
      turnSheet.classList.add("is-forward");
    } else {
      turnFront.src = current.src;
      turnBack.src = next.src;
      leftImage.src = next.src;
      turnSheet.classList.add("is-reverse");
    }

    window.setTimeout(() => updateControls(nextIndex), duration * 0.5);
    window.setTimeout(() => {
      setBaseSpread(nextIndex);
      turnSheet.classList.remove("is-forward", "is-reverse");
      shell.classList.remove("is-turning");
      isTurning = false;
    }, duration + 30);
  };

  const setProgress = (value) => {
    openProgress = Math.min(1, Math.max(0, value));
    if (reducedMotion.matches && openProgress > 0.01) openProgress = 1;
    const leftReveal = Math.min(1, Math.max(0, (openProgress - 0.18) / 0.58));
    inside.style.setProperty("--pm-open-progress", openProgress.toFixed(4));
    inside.style.setProperty("--pm-left-reveal", leftReveal.toFixed(4));
    inside.classList.toggle("has-visible-pages", openProgress > 0.08);
    inside.classList.toggle("is-cover-behind", openProgress > 0.56);
  };

  const openBook = () => {
    if (hasOpened) return;
    hasOpened = true;
    inside.classList.add("is-opening");

    if (reducedMotion.matches) {
      setProgress(1);
      inside.classList.add("is-open");
      return;
    }

    const startedAt = performance.now();
    const duration = window.innerWidth <= 720 ? 1400 : 2200;
    const animate = (now) => {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setProgress(eased);
      if (elapsed < 1) {
        requestAnimationFrame(animate);
      } else {
        setProgress(1);
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
  chapterButtons.forEach((button, index) =>
    button.addEventListener("click", () => showSpread(index)),
  );

  shell.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart = { x: event.clientX, y: event.clientY };
    shell.classList.add("is-dragging");
  });
  shell.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    shell.classList.remove("is-dragging");
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.25)
      showSpread(active + (dx < 0 ? 1 : -1));
  });
  shell.addEventListener("pointercancel", () => {
    pointerStart = null;
    shell.classList.remove("is-dragging");
  });

  const openingObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.82) {
        openBook();
        openingObserver.disconnect();
      }
    },
    { threshold: [0, 0.5, 0.7, 0.82, 0.9, 1] },
  );
  openingObserver.observe(shell);

  const finalSection = document.querySelector(".pm-final");
  let scrollTicking = false;
  const updatePageChrome = () => {
    scrollTicking = false;
    const scrollable = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const pageProgress = Math.min(1, Math.max(0, window.scrollY / scrollable));
    document.documentElement.style.setProperty(
      "--pm-page-progress",
      pageProgress.toFixed(4),
    );
    const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
    const finalTop = finalSection?.getBoundingClientRect().top ?? Infinity;
    document.body.classList.toggle("pm-past-hero", heroBottom < 120);
    document.body.classList.toggle(
      "pm-at-final",
      finalTop < window.innerHeight * 0.82,
    );
  };
  const requestPageChromeUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updatePageChrome);
  };
  window.addEventListener("scroll", requestPageChromeUpdate, { passive: true });
  window.addEventListener("resize", requestPageChromeUpdate);

  setBaseSpread(0);
  updateControls(0);
  setProgress(0);
  updatePageChrome();
})();
