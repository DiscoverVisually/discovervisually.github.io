(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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
  ) return;

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

  const counter = document.querySelector(".pm-spread-count > span");
  const description = document.querySelector(".pm-spread-controls > p");
  const status = document.querySelector(".pm-spread-status");
  const galleryEnd = document.querySelector(".pm-gallery-end");
  const chapterButtons = Array.from(
    document.querySelectorAll(".pm-chapter-nav button"),
  );
  const prevButtons = Array.from(
    document.querySelectorAll(".pm-prev, .pm-page-hotspot-left"),
  );
  const nextButtons = Array.from(
    document.querySelectorAll(".pm-next, .pm-page-hotspot-right"),
  );
  const loadedSpreads = new Set([0]);
  let active = 0;
  let openProgress = 0;
  let hasOpened = false;
  let hasCelebratedGallery = false;
  let isTurning = false;
  let pointerStart = null;

  const preloadSpread = (index) => {
    if (index < 0 || index >= spreads.length || loadedSpreads.has(index)) return;
    loadedSpreads.add(index);
    const image = new Image();
    image.decoding = "async";
    image.src = spreads[index].src;
  };

  const nudgeAmazon = () => {
    if (hasCelebratedGallery) return;
    hasCelebratedGallery = true;
    const targets = document.querySelectorAll(
      ".pm-header-amazon, .pm-sticky-buy, .pm-amazon-official",
    );
    targets.forEach((target) => target.classList.add("pm-cta-nudge"));
    window.setTimeout(
      () => targets.forEach((target) => target.classList.remove("pm-cta-nudge")),
      1800,
    );
  };

  const updateControls = (index) => {
    const spread = spreads[index];
    if (counter) {
      counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(spreads.length).padStart(2, "0")}`;
    }
    if (description) description.textContent = spread.description;
    if (status) status.textContent = `Spread ${index + 1} of ${spreads.length}: ${spread.alt}`;
    chapterButtons.forEach((button, i) => {
      if (i === index) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    prevButtons.forEach((button) => { button.disabled = index === 0; });
    nextButtons.forEach((button) => { button.disabled = index === spreads.length - 1; });
    if (galleryEnd) galleryEnd.hidden = index !== spreads.length - 1;
    preloadSpread(index - 1);
    preloadSpread(index + 1);
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
    const nextIndex = Math.max(0, Math.min(spreads.length - 1, requestedIndex));
    if (isTurning || nextIndex === active) return;

    preloadSpread(nextIndex);
    const direction = nextIndex > active ? "forward" : "reverse";
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
    const coverProgress = Math.min(1, Math.max(0, (openProgress - 0.025) / 0.88));
    const rearReveal = Math.min(1, Math.max(0, (openProgress - 0.075) / 0.5));
    const leftReveal = Math.min(1, Math.max(0, (openProgress - 0.18) / 0.58));
    inside.style.setProperty("--pm-open-progress", openProgress.toFixed(4));
    inside.style.setProperty("--pm-cover-progress", coverProgress.toFixed(4));
    inside.style.setProperty("--pm-rear-reveal", rearReveal.toFixed(4));
    inside.style.setProperty("--pm-left-reveal", leftReveal.toFixed(4));
    inside.classList.toggle("has-visible-pages", openProgress > 0.08);
    inside.classList.toggle("is-cover-behind", coverProgress > 0.535);
  };

  const revealSwipeHint = () => {
    if (window.innerWidth > 720) return;
    try {
      if (localStorage.getItem("pm-swipe-hint-seen")) return;
      localStorage.setItem("pm-swipe-hint-seen", "true");
    } catch (_) {
      // Storage can be unavailable in privacy modes; the hint remains harmless.
    }
    document.querySelector(".pm-swipe-hint")?.classList.add("is-visible");
  };

  const openBook = () => {
    if (hasOpened) return;
    hasOpened = true;
    inside.classList.add("is-opening");

    if (reducedMotion.matches) {
      setProgress(1);
      inside.classList.remove("is-opening");
      inside.classList.add("is-open");
      revealSwipeHint();
      return;
    }

    const startedAt = performance.now();
    const duration = window.innerWidth <= 720 ? 1400 : 2200;
    const animate = (now) => {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const eased = elapsed * elapsed * (3 - 2 * elapsed);
      setProgress(eased);
      if (elapsed < 1) requestAnimationFrame(animate);
      else {
        setProgress(1);
        inside.classList.remove("is-opening");
        inside.classList.add("is-open");
        revealSwipeHint();
      }
    };
    requestAnimationFrame(animate);
  };

  prevButtons.forEach((button) =>
    button.addEventListener("click", () => showSpread(active - 1)),
  );
  nextButtons.forEach((button) =>
    button.addEventListener("click", () => showSpread(active + 1)),
  );
  chapterButtons.forEach((button, index) =>
    button.addEventListener("click", () => showSpread(index)),
  );
  document.querySelector(".pm-gallery-restart")?.addEventListener("click", () =>
    showSpread(0),
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
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      showSpread(active + (dx < 0 ? 1 : -1));
    }
  });
  shell.addEventListener("pointercancel", () => {
    pointerStart = null;
    shell.classList.remove("is-dragging");
  });
  shell.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSpread(active - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSpread(active + 1);
    }
  });

  const preloadObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      spreads.forEach((_, index) => preloadSpread(index));
      preloadObserver.disconnect();
    },
    { rootMargin: "25% 0px", threshold: 0.01 },
  );
  preloadObserver.observe(inside);

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

  const modal = document.querySelector(".pm-spread-modal");
  const modalPan = modal?.querySelector(".pm-modal-pan");
  const modalImage = modalPan?.querySelector("img");
  const modalCount = modal?.querySelector(".pm-modal-count");
  const zoomLevel = modal?.querySelector(".pm-zoom-level");
  const modalPrev = modal?.querySelector(".pm-modal-prev");
  const modalNext = modal?.querySelector(".pm-modal-next");
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  const modalPointers = new Map();
  let panOrigin = null;
  let pinchOrigin = null;

  const renderModalTransform = () => {
    if (!modalPan || !zoomLevel) return;
    if (zoom === 1) {
      panX = 0;
      panY = 0;
    }
    modalPan.style.setProperty("--pm-zoom", zoom.toFixed(3));
    modalPan.style.setProperty("--pm-pan-x", `${panX.toFixed(1)}px`);
    modalPan.style.setProperty("--pm-pan-y", `${panY.toFixed(1)}px`);
    zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
  };

  const setZoom = (value) => {
    zoom = Math.max(1, Math.min(4, value));
    renderModalTransform();
  };

  const renderModalSpread = () => {
    if (!modalImage || !modalCount || !modalPrev || !modalNext) return;
    const spread = spreads[active];
    modalImage.src = spread.src;
    modalImage.alt = spread.alt;
    modalCount.textContent = `Spread ${active + 1} of ${spreads.length}`;
    modalPrev.disabled = active === 0;
    modalNext.disabled = active === spreads.length - 1;
    setZoom(1);
  };

  const jumpModal = (index) => {
    const nextIndex = Math.max(0, Math.min(spreads.length - 1, index));
    if (nextIndex === active) return;
    setBaseSpread(nextIndex);
    updateControls(nextIndex);
    renderModalSpread();
  };

  document.querySelector(".pm-expand-spread")?.addEventListener("click", () => {
    if (!modal) return;
    renderModalSpread();
    modal.showModal();
    window.setTimeout(() => modalPan?.focus(), 0);
  });
  modal?.querySelector(".pm-modal-close")?.addEventListener("click", () => modal.close());
  modalPrev?.addEventListener("click", () => jumpModal(active - 1));
  modalNext?.addEventListener("click", () => jumpModal(active + 1));
  modal?.querySelector(".pm-zoom-in")?.addEventListener("click", () => setZoom(zoom + 0.25));
  modal?.querySelector(".pm-zoom-out")?.addEventListener("click", () => setZoom(zoom - 0.25));
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
  modal?.addEventListener("close", () => {
    modalPointers.clear();
    setZoom(1);
  });
  modal?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      jumpModal(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      jumpModal(active + 1);
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoom(zoom + 0.25);
    } else if (event.key === "-") {
      event.preventDefault();
      setZoom(zoom - 0.25);
    }
  });
  modalPan?.addEventListener("wheel", (event) => {
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? 0.2 : -0.2));
  }, { passive: false });

  const pointerDistance = () => {
    const [a, b] = Array.from(modalPointers.values());
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  modalPan?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    modalPan.setPointerCapture(event.pointerId);
    modalPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (modalPointers.size === 1) {
      panOrigin = { x: event.clientX, y: event.clientY, panX, panY };
      modalPan.classList.add("is-panning");
    } else if (modalPointers.size === 2) {
      pinchOrigin = { distance: pointerDistance(), zoom };
      modalPan.classList.remove("is-panning");
      modalPan.classList.add("is-pinching");
    }
  });
  modalPan?.addEventListener("pointermove", (event) => {
    if (!modalPointers.has(event.pointerId)) return;
    modalPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (modalPointers.size === 2 && pinchOrigin) {
      setZoom(pinchOrigin.zoom * (pointerDistance() / Math.max(1, pinchOrigin.distance)));
    } else if (modalPointers.size === 1 && panOrigin && zoom > 1) {
      panX = panOrigin.panX + event.clientX - panOrigin.x;
      panY = panOrigin.panY + event.clientY - panOrigin.y;
      renderModalTransform();
    }
  });
  const endModalPointer = (event) => {
    modalPointers.delete(event.pointerId);
    if (modalPointers.size < 2) {
      pinchOrigin = null;
      modalPan?.classList.remove("is-pinching");
    }
    if (modalPointers.size === 0) {
      panOrigin = null;
      modalPan?.classList.remove("is-panning");
    }
  };
  modalPan?.addEventListener("pointerup", endModalPointer);
  modalPan?.addEventListener("pointercancel", endModalPointer);

  const stickyNav = document.querySelector(".pm-sticky-nav");
  const stickyToggle = document.querySelector(".pm-sticky-explore");
  const stickyLinks = Array.from(document.querySelectorAll(".pm-sticky-links a"));
  stickyToggle?.addEventListener("click", () => {
    const open = stickyNav?.classList.toggle("is-menu-open") ?? false;
    stickyToggle.setAttribute("aria-expanded", String(open));
  });
  stickyLinks.forEach((link) => link.addEventListener("click", () => {
    stickyNav?.classList.remove("is-menu-open");
    stickyToggle?.setAttribute("aria-expanded", "false");
  }));

  const sectionMap = stickyLinks
    .map((link) => [link, document.querySelector(link.getAttribute("href"))])
    .filter(([, section]) => section);
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sectionMap.forEach(([link, section]) => {
      if (section === visible.target) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-18% 0px -58%", threshold: [0.05, 0.2, 0.45] });
  sectionMap.forEach(([, section]) => sectionObserver.observe(section));

  const easeInOut = (value) =>
    value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    const headerOffset = id === "#top" ? 0 : 66;
    const destination = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
    const start = window.scrollY;
    const distance = destination - start;
    const duration = reducedMotion.matches ? 0 : 700;
    const startedAt = performance.now();
    const animateScroll = (now) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - startedAt) / duration);
      window.scrollTo(0, start + distance * easeInOut(progress));
      if (progress < 1) requestAnimationFrame(animateScroll);
      else {
        history.replaceState(null, "", id);
        target.classList.add("pm-section-highlight");
        window.setTimeout(() => target.classList.remove("pm-section-highlight"), 720);
      }
    };
    requestAnimationFrame(animateScroll);
  });

  const finalSection = document.querySelector(".pm-final");
  const atmosphereLayers = Array.from(document.querySelectorAll(".pm-atmosphere"));
  let scrollTicking = false;
  const updatePageChrome = () => {
    scrollTicking = false;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pageProgress = Math.min(1, Math.max(0, window.scrollY / scrollable));
    document.documentElement.style.setProperty("--pm-page-progress", pageProgress.toFixed(4));
    const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
    const finalTop = finalSection?.getBoundingClientRect().top ?? Infinity;
    document.body.classList.toggle("pm-past-hero", heroBottom < 120);
    document.body.classList.toggle("pm-at-final", finalTop < window.innerHeight * 0.82);
    if (window.innerWidth >= 1400 && !reducedMotion.matches) {
      atmosphereLayers.forEach((layer) => {
        const rect = layer.getBoundingClientRect();
        const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
        const shift = Math.max(-30, Math.min(30, centerOffset * -0.035));
        const sides = layer.querySelectorAll("i");
        sides[0]?.style.setProperty("--pm-side-shift", `${shift.toFixed(2)}px`);
        sides[1]?.style.setProperty("--pm-side-shift", `${(-shift * 0.72).toFixed(2)}px`);
      });
    }
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
  renderModalTransform();
  updatePageChrome();
})();
