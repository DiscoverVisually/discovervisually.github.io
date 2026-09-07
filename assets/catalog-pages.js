(function () {
  const books = window.DV_BOOKS || [];
  const collections = window.DV_COLLECTIONS || {};

  const cover = (book, className = "dv-catalog-cover") => book.cover
    ? `<img class="${className}" src="${book.cover}" alt="${book.title} book cover" loading="lazy">`
    : `<span class="${className} dv-catalog-cover-fallback"><small>An illustrated sacred infographic</small><strong>The<br><em>Visual</em><br>Bible</strong></span>`;

  const card = (book) => `
    <article class="dv-catalog-card" data-status="${book.status.toLowerCase().replaceAll(" ", "-")}">
      <a class="dv-catalog-image" href="${book.url}" aria-label="Explore ${book.title}">${cover(book)}<span>Explore the book <b>↗</b></span></a>
      <div class="dv-catalog-copy">
        <p>${book.audience} · ${book.status}</p>
        <h2><a href="${book.url}">${book.title}</a></h2>
        <span>${book.description}</span>
        <div class="dv-catalog-tags" aria-label="Collections">${book.collections.map(id => collections[id] ? `<a href="${collections[id].url}">${collections[id].name}</a>` : "").join("")}</div>
      </div>
    </article>`;

  const initLivingShelf = () => {
    const shelf = document.querySelector("[data-living-shelf]");
    if (!shelf || !books.length) return;

    const stage = shelf.querySelector("[data-shelf-stage]");
    const camera = shelf.querySelector("[data-shelf-camera]");
    const track = shelf.querySelector("[data-shelf-track]");
    const previous = shelf.querySelector("[data-shelf-previous]");
    const next = shelf.querySelector("[data-shelf-next]");
    const pagination = shelf.querySelector("[data-shelf-pagination]");
    const currentLabel = shelf.querySelector("[data-shelf-current]");
    const totalLabel = shelf.querySelector("[data-shelf-total]");
    const title = shelf.querySelector("[data-shelf-title]");
    const description = shelf.querySelector("[data-shelf-description]");
    const audience = shelf.querySelector("[data-shelf-audience]");
    const format = shelf.querySelector("[data-shelf-format]");
    const collectionTags = shelf.querySelector("[data-shelf-collections]");
    const exploreLink = shelf.querySelector("[data-shelf-link]");
    const live = shelf.querySelector("[data-shelf-live]");
    const hint = shelf.querySelector("[data-shelf-hint]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const narrowScreen = window.matchMedia("(max-width: 700px)");
    const storageKey = "dv-living-shelf-book";
    const hintKey = "dv-living-shelf-hint-seen";
    const defaultIndex = Math.min(1, books.length - 1);
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const mix = (start, end, progress) => start + (end - start) * progress;
    const escapeHTML = (value) => String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
    const twoDigits = (value) => String(value).padStart(2, "0");
    const visualDefaults = { accent:"#d4b06c", spine:"#14293a", spineInk:"#f8e6ae", glow:"rgba(190,139,67,.36)" };
    const bookVisuals = {
      "romantasy-yearbook": { accent:"#e3a9c9", spine:"#44203a", spineInk:"#fae8f3", glow:"rgba(198,82,155,.34)" },
      "abraham-lincoln": { accent:"#d9b568", spine:"#142940", spineInk:"#f4d486", glow:"rgba(194,148,71,.34)" },
      "hindenburg": { accent:"#dca34c", spine:"#172b3a", spineInk:"#f5d28e", glow:"rgba(206,111,45,.34)" },
      "pompeii": { accent:"#e37950", spine:"#40231d", spineInk:"#fff0d6", glow:"rgba(206,76,43,.36)" }
    };

    shelf.classList.toggle("has-archive-fillers", books.length < 8);

    let activeIndex = defaultIndex;
    try {
      const savedId = sessionStorage.getItem(storageKey);
      const savedIndex = books.findIndex((book) => book.id === savedId);
      if (savedIndex >= 0) activeIndex = savedIndex;
      if (sessionStorage.getItem(hintKey) === "true") hint?.classList.add("is-dismissed");
    } catch (_) {
      // Storage is an enhancement; the shelf works without it.
    }

    const bookMarkup = (book, index) => {
      const visual = bookVisuals[book.id] || visualDefaults;
      const name = escapeHTML(book.shortTitle || book.title);
      const front = book.cover
        ? `<img src="${escapeHTML(book.cover)}" alt="" draggable="false" loading="${Math.abs(index - activeIndex) <= 1 ? "eager" : "lazy"}">`
        : `<span class="dv-catalog-cover-fallback"><small>Discover Visually</small><strong>${name}</strong></span>`;
      const reflection = book.cover
        ? `<span class="shelf-book-reflection" aria-hidden="true"><img src="${escapeHTML(book.cover)}" alt="" draggable="false"></span>`
        : "";
      return `
        <a class="shelf-book" href="${escapeHTML(book.url)}" data-shelf-index="${index}"
          aria-label="Explore ${escapeHTML(book.title)}, book ${index + 1} of ${books.length}"
          draggable="false" style="--book-accent:${visual.accent};--book-spine:${visual.spine};--book-spine-ink:${visual.spineInk || visualDefaults.spineInk};--book-glow:${visual.glow}">
          <span class="shelf-book-object" aria-hidden="true">
            <span class="shelf-book-face shelf-book-front">${front}</span>
            <span class="shelf-book-face shelf-book-edge shelf-book-edge-left"><span>${name}</span></span>
            <span class="shelf-book-face shelf-book-edge shelf-book-edge-right"><span>${name}</span></span>
          </span>
          <span class="shelf-book-spine-card" aria-hidden="true"><span>${name}</span></span>
          ${reflection}
          <span class="shelf-book-quick" aria-hidden="true"><span>Explore ${name}</span><b>↗</b></span>
        </a>`;
    };

    track.innerHTML = books.map(bookMarkup).join("");
    pagination.innerHTML = books.map((book, index) =>
      `<button type="button" data-shelf-page="${index}" aria-label="Show ${escapeHTML(book.title)}">${index + 1}</button>`
    ).join("");

    const bookElements = [...track.querySelectorAll("[data-shelf-index]")];
    const pageButtons = [...pagination.querySelectorAll("[data-shelf-page]")];
    let visualPosition = activeIndex;
    let detailTimer = 0;
    let animationTimer = 0;
    let resizeFrame = 0;
    let edgeTimer = 0;
    let edgeDirection = 0;
    let edgeIntensity = 0;
    let prefetchTimer = 0;
    let wheelTimer = 0;
    let drag = null;
    let suppressClicksUntil = 0;
    const prefetched = new Set();

    const slotGeometry = (distance) => {
      const mobile = narrowScreen.matches;
      const absolute = Math.abs(distance);
      const direction = Math.sign(distance) || 1;
      const viewportWidth = stage.clientWidth || window.innerWidth;
      const layoutWidth = Math.min(viewportWidth, mobile ? 760 : 1600);
      const easeOutCubic = (value) => 1 - Math.pow(1 - clamp(value, 0, 1), 3);
      const smoothstep = (value) => {
        const progress = clamp(value, 0, 1);
        return progress * progress * (3 - 2 * progress);
      };
      const sideX = mobile
        ? Math.min(layoutWidth * .39, 165)
        : clamp(layoutWidth * .205, 220, 328);
      const spineBase = mobile
        ? Math.min(layoutWidth * .47, 205)
        : clamp(layoutWidth * .325, 330, 520);
      const spinePitch = mobile
        ? clamp(layoutWidth * .055, 18, 24)
        : clamp(layoutWidth * .024, 27, 39);
      let geometry;

      if (absolute <= 1) {
        const progress = smoothstep(absolute);
        geometry = {
          x:mix(0, sideX, progress),
          y:mix(mobile ? -4 : -6, mobile ? 8 : 7, progress),
          z:mix(mobile ? 80 : 105, mobile ? -28 : 0, progress),
          rotate:mix(0, mobile ? 56 : 12, progress),
          scale:mix(1, mobile ? .82 : .89, progress),
          opacity:mix(1, mobile ? .78 : .95, progress),
          saturation:mix(1, mobile ? .82 : .94, progress),
          brightness:mix(1, mobile ? .84 : .94, progress),
          spine:0
        };
      } else if (absolute < 2) {
        const progress = absolute - 1;
        const turn = easeOutCubic(progress);
        geometry = {
          x:mix(sideX, spineBase, progress),
          y:mix(mobile ? 8 : 7, mobile ? 18 : 18, progress),
          z:mix(mobile ? -28 : 0, mobile ? -24 : -12, progress),
          rotate:mix(mobile ? 56 : 12, mobile ? 88 : 88, turn),
          scale:mix(mobile ? .82 : .89, mobile ? .76 : .88, progress),
          opacity:mix(mobile ? .78 : .95, mobile ? .58 : .9, progress),
          saturation:mix(mobile ? .82 : .94, mobile ? .68 : .82, progress),
          brightness:mix(mobile ? .84 : .94, mobile ? .7 : .82, progress),
          spine:smoothstep((turn - .42) / .45)
        };
      } else {
        const x = spineBase + (absolute - 2) * spinePitch;
        const fadeStart = Math.max(spineBase, viewportWidth / 2 - (mobile ? 28 : 110));
        const fadeEnd = viewportWidth / 2 + (mobile ? 34 : 52);
        const edgeVisibility = 1 - smoothstep((x - fadeStart) / Math.max(fadeEnd - fadeStart, 1));
        geometry = {
          x,
          y:mobile ? 18 : 18,
          z:(mobile ? -24 : -12) - Math.min(absolute - 2, 8) * 1.5,
          rotate:mobile ? 88.5 : 88.8,
          scale:mobile ? .76 : .88,
          opacity:(mobile ? .58 : .9) * edgeVisibility,
          saturation:mobile ? .68 : .82,
          brightness:mobile ? .7 : .82,
          spine:1
        };
      }

      return {
        ...geometry,
        x:geometry.x * direction,
        rotate:geometry.rotate * direction * -1,
        distance:absolute,
        interactive:geometry.opacity > .12
      };
    };

    const prepareMotion = (fromPosition, toPosition) => {
      bookElements.forEach((element, index) => {
        const fromDistance = Math.abs(index - fromPosition);
        const toDistance = Math.abs(index - toPosition);
        const arrivingFromSpine = toDistance < fromDistance && fromDistance > 1.15;
        const leavingForSpine = toDistance > fromDistance && toDistance > 1.15;
        element.style.setProperty("--shelf-rotation-delay", arrivingFromSpine ? "340ms" : "0ms");
        element.style.setProperty("--shelf-spine-delay", arrivingFromSpine ? "280ms" : leavingForSpine ? "150ms" : "0ms");
      });
    };

    const renderPosition = (position) => {
      visualPosition = position;
      bookElements.forEach((element, index) => {
        const geometry = slotGeometry(index - position);
        element.style.setProperty("--shelf-x", `${geometry.x.toFixed(2)}px`);
        element.style.setProperty("--shelf-y", `${geometry.y.toFixed(2)}px`);
        element.style.setProperty("--shelf-z", `${geometry.z.toFixed(2)}px`);
        element.style.setProperty("--shelf-rotate", `${geometry.rotate.toFixed(2)}deg`);
        element.style.setProperty("--shelf-scale", geometry.scale.toFixed(4));
        element.style.setProperty("--shelf-opacity", geometry.opacity.toFixed(4));
        element.style.setProperty("--shelf-saturation", geometry.saturation.toFixed(4));
        element.style.setProperty("--shelf-brightness", geometry.brightness.toFixed(4));
        element.style.setProperty("--shelf-spine-opacity", geometry.spine.toFixed(4));
        element.dataset.shelfView = geometry.distance < .55 ? "front" : geometry.spine > .72 ? "spine" : "cover";
        element.classList.toggle("is-shelf-visible", geometry.interactive);
        const layer = geometry.spine > .72
          ? 94 - Math.max(geometry.distance - 2, 0) * 2
          : 100 - geometry.distance * 7;
        element.style.zIndex = String(Math.round(layer));
        element.style.pointerEvents = geometry.interactive ? "" : "none";
        if (geometry.interactive) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", "true");
      });
    };

    const rememberBook = (book) => {
      try { sessionStorage.setItem(storageKey, book.id); } catch (_) {}
    };

    const dismissHint = () => {
      if (!hint || hint.classList.contains("is-dismissed")) return;
      hint.classList.add("is-dismissed");
      try { sessionStorage.setItem(hintKey, "true"); } catch (_) {}
    };

    const prefetchBook = (book) => {
      if (!book || prefetched.has(book.url)) return;
      prefetched.add(book.url);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = book.url;
      document.head.append(link);
    };

    const applyBookDetails = (index, announce) => {
      const book = books[index];
      const visual = bookVisuals[book.id] || visualDefaults;
      currentLabel.textContent = twoDigits(index + 1);
      totalLabel.textContent = twoDigits(books.length);
      title.textContent = book.shortTitle || book.title;
      description.textContent = book.description;
      audience.textContent = book.audience;
      format.textContent = book.format;
      exploreLink.href = book.url;
      collectionTags.innerHTML = book.collections
        .map((id) => collections[id] ? `<a href="${collections[id].url}">${collections[id].name}</a>` : "")
        .join("");
      shelf.style.setProperty("--shelf-accent", visual.accent);
      shelf.style.setProperty("--shelf-glow", visual.glow);
      shelf.dataset.activeBook = book.id;
      if (announce) live.textContent = `${book.title}. Book ${index + 1} of ${books.length}.`;
      window.requestAnimationFrame(() => shelf.classList.remove("is-copy-changing"));
    };

    const updateActiveState = (announce = true, immediate = false) => {
      bookElements.forEach((element, index) => {
        const active = index === activeIndex;
        element.classList.toggle("is-active", active);
        element.tabIndex = active ? 0 : -1;
        if (active) element.setAttribute("aria-current", "true");
        else element.removeAttribute("aria-current");
      });
      pageButtons.forEach((button, index) => {
        if (index === activeIndex) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
      previous.disabled = activeIndex === 0;
      next.disabled = activeIndex === books.length - 1;
      clearTimeout(detailTimer);
      if (immediate || reducedMotion.matches) {
        applyBookDetails(activeIndex, announce);
      } else {
        shelf.classList.add("is-copy-changing");
        detailTimer = window.setTimeout(() => applyBookDetails(activeIndex, announce), 620);
      }
      rememberBook(books[activeIndex]);
    };

    const goTo = (requestedIndex, options = {}) => {
      const index = clamp(Math.round(requestedIndex), 0, books.length - 1);
      const changed = index !== activeIndex;
      const previousPosition = visualPosition;
      activeIndex = index;
      shelf.classList.remove("is-dragging");
      if (!reducedMotion.matches) shelf.classList.add("is-animating");
      prepareMotion(previousPosition, index);
      renderPosition(index);
      updateActiveState(options.announce !== false, !changed);
      if (options.dismissHint !== false) dismissHint();
      clearTimeout(animationTimer);
      animationTimer = window.setTimeout(() => {
        shelf.classList.remove("is-animating");
        bookElements.forEach((element) => {
          element.style.removeProperty("--shelf-rotation-delay");
          element.style.removeProperty("--shelf-spine-delay");
        });
      }, reducedMotion.matches ? 0 : 1400);
    };

    const clearEdgeMovement = () => {
      clearTimeout(edgeTimer);
      edgeTimer = 0;
      edgeDirection = 0;
      edgeIntensity = 0;
      shelf.removeAttribute("data-edge-direction");
    };

    const continueEdgeMovement = () => {
      if (!edgeDirection || drag) return;
      const target = activeIndex + edgeDirection;
      if (target < 0 || target >= books.length) {
        clearTimeout(edgeTimer);
        edgeTimer = 0;
        return;
      }
      goTo(target, { announce:true });
      const pause = 1450 + (1 - edgeIntensity) * 360;
      edgeTimer = window.setTimeout(continueEdgeMovement, pause);
    };

    const setEdgeMovement = (direction, intensity) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      if (direction === edgeDirection) {
        edgeIntensity = intensity;
        return;
      }
      clearEdgeMovement();
      if (!direction) return;
      edgeDirection = direction;
      edgeIntensity = intensity;
      shelf.dataset.edgeDirection = direction < 0 ? "left" : "right";
      const intentDelay = 180 + (1 - intensity) * 220;
      edgeTimer = window.setTimeout(continueEdgeMovement, intentDelay);
    };

    const onPassivePointerMove = (event) => {
      if (drag || event.pointerType !== "mouse" || event.target.closest(".shelf-book,.shelf-navigation")) {
        clearEdgeMovement();
        return;
      }
      const bounds = stage.getBoundingClientRect();
      const normalized = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const absolute = Math.abs(normalized);
      if (absolute < .36) {
        setEdgeMovement(0, 0);
        return;
      }
      const direction = normalized < 0 ? -1 : 1;
      const intensity = clamp((absolute - .36) / .64, 0, 1);
      setEdgeMovement(direction, intensity);
    };

    const finishDrag = (event, cancelled = false) => {
      if (!drag || (event && event.pointerId !== drag.pointerId)) return;
      const snapshot = drag;
      drag = null;
      if (stage.hasPointerCapture?.(snapshot.pointerId)) stage.releasePointerCapture(snapshot.pointerId);
      shelf.classList.remove("is-dragging");
      if (cancelled || !snapshot.horizontal) {
        renderPosition(activeIndex);
        return;
      }
      const distance = snapshot.lastX - snapshot.startX;
      let target = Math.round(visualPosition);
      if (narrowScreen.matches) {
        target = snapshot.startIndex;
        if (Math.abs(distance) > 36 || Math.abs(snapshot.velocity) > .42) target += distance < 0 ? 1 : -1;
      } else if (Math.abs(distance) > 42 && target === snapshot.startIndex) {
        target += distance < 0 ? 1 : -1;
      }
      suppressClicksUntil = Date.now() + 420;
      goTo(target, { announce:true });
    };

    stage.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest("button,[data-shelf-link],.living-shelf-collections")) return;
      clearEdgeMovement();
      const startedOnBook = Boolean(event.target.closest(".shelf-book"));
      drag = {
        pointerId:event.pointerId,
        startX:event.clientX,
        startY:event.clientY,
        lastX:event.clientX,
        lastTime:performance.now(),
        velocity:0,
        startIndex:activeIndex,
        horizontal:null
      };
      if (event.pointerType === "mouse" && !startedOnBook) stage.setPointerCapture?.(event.pointerId);
    });

    stage.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) {
        onPassivePointerMove(event);
        return;
      }
      const totalX = event.clientX - drag.startX;
      const totalY = event.clientY - drag.startY;
      if (drag.horizontal === null) {
        if (Math.hypot(totalX, totalY) < 7) return;
        if (Math.abs(totalY) > Math.abs(totalX) * 1.15) {
          drag.horizontal = false;
          return;
        }
        drag.horizontal = true;
        stage.setPointerCapture?.(event.pointerId);
        shelf.classList.add("is-dragging");
        dismissHint();
      }
      if (!drag.horizontal) return;
      event.preventDefault();
      const now = performance.now();
      const elapsed = Math.max(now - drag.lastTime, 1);
      drag.velocity = (event.clientX - drag.lastX) / elapsed;
      drag.lastX = event.clientX;
      drag.lastTime = now;
      const stepWidth = clamp(stage.clientWidth * (narrowScreen.matches ? .42 : .24), 150, 340);
      const position = clamp(drag.startIndex - totalX / stepWidth, 0, books.length - 1);
      renderPosition(position);
    });

    stage.addEventListener("pointerup", (event) => finishDrag(event));
    stage.addEventListener("pointercancel", (event) => finishDrag(event, true));
    stage.addEventListener("pointerleave", (event) => {
      clearEdgeMovement();
      if (drag && event.pointerType === "mouse" && !stage.hasPointerCapture?.(event.pointerId)) finishDrag(event);
    });
    stage.addEventListener("dragstart", (event) => event.preventDefault());
    stage.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.2 || Math.abs(event.deltaX) < 18) return;
      event.preventDefault();
      if (wheelTimer) return;
      clearEdgeMovement();
      goTo(activeIndex + (event.deltaX > 0 ? 1 : -1), { announce:true });
      wheelTimer = window.setTimeout(() => { wheelTimer = 0; }, reducedMotion.matches ? 120 : 950);
    }, { passive:false });

    track.addEventListener("click", (event) => {
      if (Date.now() < suppressClicksUntil) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const bookElement = event.target.closest("[data-shelf-index]");
      if (bookElement) rememberBook(books[Number(bookElement.dataset.shelfIndex)]);
    }, true);

    bookElements.forEach((element, index) => {
      element.addEventListener("pointerenter", () => {
        clearEdgeMovement();
        clearTimeout(prefetchTimer);
        prefetchTimer = window.setTimeout(() => prefetchBook(books[index]), 360);
      });
      element.addEventListener("pointerleave", () => clearTimeout(prefetchTimer));
    });

    previous.addEventListener("click", () => {
      clearEdgeMovement();
      goTo(activeIndex - 1, { announce:true });
    });
    next.addEventListener("click", () => {
      clearEdgeMovement();
      goTo(activeIndex + 1, { announce:true });
    });
    pageButtons.forEach((button) => button.addEventListener("click", () => {
      clearEdgeMovement();
      goTo(Number(button.dataset.shelfPage), { announce:true });
    }));

    shelf.addEventListener("keydown", (event) => {
      const carouselControl = event.target === camera || event.target.closest(".shelf-book,.shelf-navigation");
      if (!carouselControl) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        clearEdgeMovement();
        goTo(activeIndex - 1, { announce:true });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        clearEdgeMovement();
        goTo(activeIndex + 1, { announce:true });
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0, { announce:true });
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(books.length - 1, { announce:true });
      } else if (event.key === "Enter" && event.target === camera) {
        rememberBook(books[activeIndex]);
        window.location.href = books[activeIndex].url;
      }
    });

    exploreLink.addEventListener("pointerenter", () => {
      clearTimeout(prefetchTimer);
      prefetchTimer = window.setTimeout(() => prefetchBook(books[activeIndex]), 240);
    });
    exploreLink.addEventListener("click", () => rememberBook(books[activeIndex]));
    stage.addEventListener("pointerleave", clearEdgeMovement);
    window.addEventListener("blur", clearEdgeMovement);
    reducedMotion.addEventListener?.("change", clearEdgeMovement);
    window.addEventListener("resize", () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => renderPosition(visualPosition));
    }, { passive:true });

    if (!finePointer.matches && hint) hint.innerHTML = '<span aria-hidden="true">↔</span> Swipe or drag to browse';
    renderPosition(activeIndex);
    updateActiveState(false, true);
    prefetchBook(books[activeIndex]);
  };

  document.querySelectorAll("[data-catalog-grid]").forEach((grid) => {
    const collection = grid.dataset.catalogGrid;
    const shown = collection === "all" ? books : books.filter(book => book.collections.includes(collection));
    grid.innerHTML = shown.length ? shown.map(card).join("") : `<div class="catalog-empty"><p class="catalog-kicker">The next shelf is taking shape</p><h2>Visual Learning.<em>Coming soon.</em></h2><p>We are developing visual guides that make complex ideas easier to see, explore and remember.</p><a href="/books/">Browse the current books <b>→</b></a></div>`;
    const count = document.querySelector("[data-catalog-count]");
    if (count) count.textContent = `${shown.length} ${shown.length === 1 ? "title" : "titles"}`;
  });

  initLivingShelf();

  document.querySelectorAll("[data-related-books]").forEach((section) => {
    const current = section.dataset.relatedBooks;
    const book = books.find(item => item.id === current);
    if (!book) return;
    const related = books
      .filter(item => item.id !== current)
      .map(item => ({ item, score: item.collections.filter(id => book.collections.includes(id)).length }))
      .sort((a,b) => b.score - a.score)
      .slice(0,3)
      .map(match => match.item);
    const collection = collections[book.primaryCollection];
    section.innerHTML = `
      <div class="dv-related-head"><div><p class="dv-related-kicker">Continue exploring</p><h2>More for curious readers</h2></div><a class="dv-related-all" href="${collection.url}">Explore all ${collection.name.toLowerCase()} books →</a></div>
      <div class="dv-related-grid">${related.map(item => `<a class="dv-related-card" href="${item.url}">${item.cover ? `<img src="${item.cover}" alt="${item.title} book cover" loading="lazy">` : `<span class="dv-related-cover-fallback">The<br>Visual<br>Bible</span>`}<span><small>${item.audience} · ${item.status}</small><strong>${item.title}</strong><span>${item.format}</span></span></a>`).join("")}</div>`;
  });
})();
