(() => {
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!supportsHover || reduceMotion || window.innerWidth < 901) return;

  const hero = document.querySelector(".hero");
  const stage = document.querySelector(".hero-stage");
  if (!hero || !stage) return;

  const meta = new Map([
    ["/books/pompeii-the-last-day.html", { title: "Pompeii: The Last Day", amazon: "https://www.amazon.com/dp/B0H6NMNL53", rotation: -8 }],
    ["/books/i-worked-for-abraham-lincoln.html", { title: "I Worked for Abraham Lincoln", amazon: "https://www.amazon.com/dp/B0HHJYQD5P", rotation: 0 }],
    ["/books/hindenburg-the-final-flight.html", { title: "Hindenburg: The Final Flight", amazon: "https://www.amazon.com/dp/B0HH7K5L5L", rotation: 8 }]
  ]);

  const books = [...stage.querySelectorAll(".hero-book")];
  if (!books.length) return;

  let active = null;
  let closeTimer = 0;
  let settleTimer = 0;
  let pointer = { x: -9999, y: -9999 };

  const expandedContains = (rect, x, y, pad = 0) =>
    x >= rect.left - pad && x <= rect.right + pad && y >= rect.top - pad && y <= rect.bottom + pad;

  function clearTimers() {
    window.clearTimeout(closeTimer);
    window.clearTimeout(settleTimer);
    closeTimer = 0;
    settleTimer = 0;
  }

  function corridorContains(x, y) {
    if (!active) return false;
    const a = active.originRect;
    const b = active.finalRect;
    const c = active.actions.getBoundingClientRect();
    const pad = 34;
    const corridor = {
      left: Math.min(a.left, b.left, c.left) - pad,
      right: Math.max(a.right, b.right, c.right) + pad,
      top: Math.min(a.top, b.top, c.top) - pad,
      bottom: Math.max(a.bottom, b.bottom, c.bottom) + pad
    };
    return expandedContains(corridor, x, y, 0);
  }

  function scheduleClose(delay = 105) {
    if (!active || active.closing) return;
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => closeFocus(false), delay);
  }

  function cancelClose() {
    window.clearTimeout(closeTimer);
    closeTimer = 0;
  }

  function positionActions(actions, finalRect) {
    const preferredTop = finalRect.bottom + 18;
    const bottomRoom = window.innerHeight - preferredTop;
    const top = bottomRoom >= 70 ? preferredTop : Math.max(18, finalRect.bottom - 62);
    actions.style.left = `${finalRect.left + finalRect.width / 2}px`;
    actions.style.top = `${top}px`;
  }

  function startFocus(source) {
    if (active?.source === source || active?.closing) return;
    if (active) closeFocus(true);

    const href = new URL(source.href, window.location.origin).pathname;
    const bookMeta = meta.get(href);
    const image = source.querySelector("img");
    if (!bookMeta || !image) return;

    const originRect = source.getBoundingClientRect();
    const baseWidth = source.offsetWidth || originRect.width;
    const baseHeight = source.offsetHeight || originRect.height;
    const finalScale = 1.5;
    const finalWidth = baseWidth * finalScale;
    const finalHeight = baseHeight * finalScale;

    const targetX = window.innerWidth / 2;
    const naturalTargetY = window.innerHeight / 2 - 18;
    const minTargetY = finalHeight / 2 + 24;
    const maxTargetY = window.innerHeight - finalHeight / 2 - 78;
    const targetY = Math.max(minTargetY, Math.min(naturalTargetY, maxTargetY));

    const finalRect = {
      left: targetX - finalWidth / 2,
      top: targetY - finalHeight / 2,
      right: targetX + finalWidth / 2,
      bottom: targetY + finalHeight / 2,
      width: finalWidth,
      height: finalHeight
    };

    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;
    const dx = originCenterX - targetX;
    const dy = originCenterY - targetY;
    const inverseScale = 1 / finalScale;
    const initialTransform = `translate3d(${dx}px, ${dy}px, 0) scale(${inverseScale}) rotate(${bookMeta.rotation}deg)`;
    const finalTransform = "translate3d(0, 0, 0) scale(1) rotate(0deg)";

    const layer = document.createElement("div");
    layer.className = "hero-focus-layer";
    layer.innerHTML = `
      <div class="hero-focus-backdrop" aria-hidden="true"></div>
      <div class="hero-focus-card is-entering">
        <a class="hero-focus-cover" href="${href}" aria-label="Explore ${bookMeta.title}">
          <img src="${image.currentSrc || image.src}" alt="${image.alt}">
          <span class="hero-focus-look-hint">Click cover to look inside</span>
        </a>
      </div>
      <div class="hero-focus-actions" aria-label="${bookMeta.title} quick actions">
        <span><small>History Hunters · Available now</small><strong>${bookMeta.title}</strong></span>
        <a class="hero-focus-amazon" href="${bookMeta.amazon}" target="_blank" rel="noopener noreferrer">View on Amazon <b aria-hidden="true">↗</b></a>
      </div>`;

    document.body.appendChild(layer);
    const backdrop = layer.querySelector(".hero-focus-backdrop");
    const card = layer.querySelector(".hero-focus-card");
    const cover = layer.querySelector(".hero-focus-cover");
    const actions = layer.querySelector(".hero-focus-actions");

    Object.assign(card.style, {
      left: `${finalRect.left}px`,
      top: `${finalRect.top}px`,
      width: `${finalWidth}px`,
      height: `${finalHeight}px`,
      transform: initialTransform
    });
    positionActions(actions, finalRect);

    active = {
      source,
      layer,
      backdrop,
      card,
      cover,
      actions,
      originRect,
      finalRect,
      initialTransform,
      finalTransform,
      closing: false,
      settled: false
    };

    hero.classList.add("hero-cinematic-active");
    stage.classList.add("hero-cinematic-active");
    source.classList.add("hero-book-is-source");

    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 430,
      easing: "ease-out",
      fill: "forwards"
    });

    card.animate(
      [{ transform: initialTransform }, { transform: finalTransform }],
      { duration: 760, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "forwards" }
    );

    settleTimer = window.setTimeout(() => {
      if (!active || active.card !== card || active.closing) return;
      active.settled = true;
      card.classList.remove("is-entering");
      card.classList.add("is-settled");
      actions.classList.add("is-visible");
    }, 535);

    backdrop.addEventListener("pointerdown", (event) => {
      if (event.target === backdrop) closeFocus(false);
    });

    cover.addEventListener("pointerenter", cancelClose);
    actions.addEventListener("pointerenter", cancelClose);
    cover.addEventListener("pointerleave", () => {
      if (active?.settled && !corridorContains(pointer.x, pointer.y)) scheduleClose(95);
    });
    actions.addEventListener("pointerleave", () => {
      if (active?.settled && !corridorContains(pointer.x, pointer.y)) scheduleClose(95);
    });

    cover.addEventListener("pointermove", (event) => {
      if (!active?.settled) return;
      const rect = cover.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - .5;
      const py = (event.clientY - rect.top) / rect.height - .5;
      cover.style.setProperty("--focus-tilt-y", `${(px * 4.2).toFixed(2)}deg`);
      cover.style.setProperty("--focus-tilt-x", `${(-py * 3.2).toFixed(2)}deg`);
    });
    cover.addEventListener("pointerleave", () => {
      cover.style.setProperty("--focus-tilt-y", "0deg");
      cover.style.setProperty("--focus-tilt-x", "0deg");
    });
  }

  function closeFocus(immediate = false) {
    if (!active) return;
    const current = active;
    if (current.closing && !immediate) return;
    current.closing = true;
    clearTimers();

    current.actions.classList.remove("is-visible");
    current.card.classList.remove("is-settled", "is-entering");

    if (immediate) {
      current.layer.remove();
      current.source.classList.remove("hero-book-is-source");
      hero.classList.remove("hero-cinematic-active");
      stage.classList.remove("hero-cinematic-active");
      if (active === current) active = null;
      return;
    }

    const fromTransform = getComputedStyle(current.card).transform;
    current.card.getAnimations().forEach((animation) => animation.cancel());
    current.backdrop.getAnimations().forEach((animation) => animation.cancel());

    current.card.animate(
      [{ transform: fromTransform }, { transform: current.initialTransform }],
      { duration: 350, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "forwards" }
    );
    current.backdrop.animate(
      [{ opacity: Number.parseFloat(getComputedStyle(current.backdrop).opacity) || 1 }, { opacity: 0 }],
      { duration: 260, easing: "ease-in", fill: "forwards" }
    );

    window.setTimeout(() => current.source.classList.remove("hero-book-is-source"), 205);
    window.setTimeout(() => {
      current.layer.remove();
      hero.classList.remove("hero-cinematic-active");
      stage.classList.remove("hero-cinematic-active");
      if (active === current) active = null;
    }, 365);
  }

  books.forEach((book) => {
    book.addEventListener("pointerenter", () => startFocus(book));
  });

  document.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    if (!active || active.closing || !active.settled) return;
    if (corridorContains(event.clientX, event.clientY)) cancelClose();
    else scheduleClose(105);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeFocus(false);
  });
  window.addEventListener("scroll", () => closeFocus(true), { passive: true });
  window.addEventListener("resize", () => closeFocus(true));
  window.addEventListener("blur", () => closeFocus(true));
})();
