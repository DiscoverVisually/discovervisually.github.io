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
    const visualDefaults = { accent:"#d4b06c", spine:"#14293a", glow:"rgba(190,139,67,.36)" };
    const bookVisuals = {
      "romantasy-yearbook": { accent:"#e3a9c9", spine:"#44203a", glow:"rgba(198,82,155,.34)" },
      "abraham-lincoln": { accent:"#d9b568", spine:"#142940", glow:"rgba(194,148,71,.34)" },
      "hindenburg": { accent:"#dca34c", spine:"#172b3a", glow:"rgba(206,111,45,.34)" },
      "pompeii": { accent:"#e37950", spine:"#40231d", glow:"rgba(206,76,43,.36)" }
    };

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
          draggable="false" style="--book-accent:${visual.accent};--book-spine:${visual.spine};--book-glow:${visual.glow}">
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
      const slots = mobile
        ? [
            { x:0, y:-4, z:80, rotate:0, scale:1, opacity:1, saturation:1, brightness:1, spine:0 },
            { x:.385, y:8, z:-65, rotate:58, scale:.78, opacity:.72, saturation:.78, brightness:.78, spine:.12 },
            { x:.59, y:17, z:-190, rotate:82, scale:.61, opacity:.22, saturation:.5, brightness:.62, spine:1 },
            { x:.68, y:22, z:-270, rotate:88, scale:.5, opacity:0, saturation:.4, brightness:.52, spine:1 }
          ]
        : [
            { x:0, y:-7, z:105, rotate:0, scale:1, opacity:1, saturation:1, brightness:1, spine:0 },
            { x:.195, y:2, z:-4, rotate:13, scale:.88, opacity:.91, saturation:.9, brightness:.9, spine:0 },
            { x:.345, y:13, z:-125, rotate:46, scale:.74, opacity:.69, saturation:.68, brightness:.77, spine:.42 },
            { x:.465, y:23, z:-235, rotate:82, scale:.61, opacity:.4, saturation:.48, brightness:.61, spine:1 },
            { x:.53, y:29, z:-310, rotate:88, scale:.5, opacity:0, saturation:.4, brightness:.52, spine:1 }
          ];
      const absolute = Math.abs(distance);
      const lowerIndex = Math.min(Math.floor(absolute), slots.length - 1);
      const upperIndex = Math.min(lowerIndex + 1, slots.length - 1);
      const progress = clamp(absolute - lowerIndex, 0, 1);
      const lower = slots[lowerIndex];
      const upper = slots[upperIndex];
      const width = Math.min(stage.clientWidth || window.innerWidth, mobile ? 760 : 1600);
      const direction = Math.sign(distance) || 1;
      return {
        x:mix(lower.x, upper.x, progress) * width * direction,
        y:mix(lower.y, upper.y, progress),
        z:mix(lower.z, upper.z, progress),
        rotate:mix(lower.rotate, upper.rotate, progress) * direction * -1,
        scale:mix(lower.scale, upper.scale, progress),
        opacity:mix(lower.opacity, upper.opacity, progress),
        saturation:mix(lower.saturation, upper.saturation, progress),
        brightness:mix(lower.brightness, upper.brightness, progress),
        spine:mix(lower.spine, upper.spine, progress),
        distance:absolute
      };
    };

    const renderPosition = (position) => {
      visualPosition = position;
      bookElements.forEach((element, index) => {
        const geometry = slotGeometry(index - position);
        element.style.setProperty("--shelf-x", `${geometry.x.toFixed(2)}px`);
        element.style.setProperty("--shelf-y", `${geometry.y.toFixed(2)}px`);
        element.style.setProperty("--shelf-z", `${geometry.z.toFixed(2)}px`);
        element.style.setProperty("--shelf-rotate", `${geometry.rotate.toFixed(2)}deg`);
        element.style.setProperty("--shelf-inverse-rotate", `${(geometry.rotate * -1).toFixed(2)}deg`);
        element.style.setProperty("--shelf-scale", geometry.scale.toFixed(4));
        element.style.setProperty("--shelf-opacity", geometry.opacity.toFixed(4));
        element.style.setProperty("--shelf-saturation", geometry.saturation.toFixed(4));
        element.style.setProperty("--shelf-brightness", geometry.brightness.toFixed(4));
        element.style.setProperty("--shelf-spine-opacity", geometry.spine.toFixed(4));
        element.style.zIndex = String(Math.round(100 - geometry.distance * 12));
        element.style.pointerEvents = geometry.distance > 3.1 ? "none" : "";
        element.setAttribute("aria-hidden", geometry.distance > 3.1 ? "true" : "false");
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
        detailTimer = window.setTimeout(() => applyBookDetails(activeIndex, announce), 260);
      }
      rememberBook(books[activeIndex]);
    };

    const goTo = (requestedIndex, options = {}) => {
      const index = clamp(Math.round(requestedIndex), 0, books.length - 1);
      const changed = index !== activeIndex;
      activeIndex = index;
      visualPosition = index;
      shelf.classList.remove("is-dragging");
      if (!reducedMotion.matches) shelf.classList.add("is-animating");
      renderPosition(index);
      updateActiveState(options.announce !== false, !changed);
      if (options.dismissHint !== false) dismissHint();
      clearTimeout(animationTimer);
      animationTimer = window.setTimeout(() => shelf.classList.remove("is-animating"), reducedMotion.matches ? 0 : 1400);
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
      if (event.pointerType === "mouse") stage.setPointerCapture?.(event.pointerId);
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
