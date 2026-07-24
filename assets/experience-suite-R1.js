(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  document.documentElement.classList.add("dv-enhanced");
  const revealHero = () => {
    document.documentElement.classList.add("dv-entered");
    document.documentElement.classList.remove("dv-enhanced");
  };
  requestAnimationFrame(() => requestAnimationFrame(revealHero));
  setTimeout(revealHero, 700);

  const chapters = [
    ["top", "Enter"],
    ["worlds", "Choose"],
    ["story", "Our story"],
    ["featured", "Explore"],
    ["newsletter", "Stay curious"]
  ];
  $(".book-story")?.setAttribute("id", "story");

  const chapterNav = document.createElement("nav");
  chapterNav.className = "chapter-nav";
  chapterNav.setAttribute("aria-label", "Page chapters");
  chapterNav.innerHTML = chapters.map(([id, label], index) =>
    `<button type="button" data-target="${id}" aria-label="Go to ${label}"><span>${String(index + 1).padStart(2, "0")}</span><b>${label}</b></button>`
  ).join("");
  document.body.appendChild(chapterNav);
  $$("button", chapterNav).forEach((button) => button.addEventListener("click", () => {
    document.getElementById(button.dataset.target)?.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth" });
  }));

  const updateChapter = () => {
    const marker = innerHeight * .42;
    let active = 0;
    chapters.forEach(([id], index) => {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= marker) active = index;
    });
    $$("button", chapterNav).forEach((button, index) => button.classList.toggle("is-active", index === active));
    const pageRange = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    document.documentElement.style.setProperty("--chapter-progress", `${Math.min(100, scrollY / pageRange * 100)}%`);
  };

  const thread = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  thread.classList.add("story-thread");
  thread.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  thread.appendChild(path);
  const threadDots = chapters.map(() => {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("r", "3.5");
    thread.appendChild(dot);
    return dot;
  });
  $("main")?.appendChild(thread);

  let threadLength = 1;
  const updateThread = () => {
    const pageRange = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, (scrollY + innerHeight * .42) / pageRange));
    path.style.strokeDashoffset = String(threadLength * (1 - progress));
  };
  const layoutThread = () => {
    if (innerWidth <= 760 || !$("main")) return;
    const height = $("main").scrollHeight;
    const width = innerWidth;
    thread.setAttribute("width", String(width));
    thread.setAttribute("height", String(height));
    thread.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const points = chapters.map(([id], index) => {
      const section = document.getElementById(id);
      const rect = section?.getBoundingClientRect();
      const y = (rect?.top || 0) + scrollY + Math.min(rect?.height || 0, innerHeight) * .55;
      const xRatios = [.79, .94, .96, .93, .78];
      return [width * xRatios[index], y];
    });
    const d = points.reduce((value, point, index) => {
      if (!index) return `M ${point[0]} ${point[1]}`;
      const previous = points[index - 1];
      const midY = (previous[1] + point[1]) / 2;
      return `${value} C ${previous[0]} ${midY}, ${point[0]} ${midY}, ${point[0]} ${point[1]}`;
    }, "");
    path.setAttribute("d", d);
    threadDots.forEach((dot, index) => {
      dot.setAttribute("cx", String(points[index][0]));
      dot.setAttribute("cy", String(points[index][1]));
    });
    threadLength = path.getTotalLength();
    path.style.strokeDasharray = String(threadLength);
    updateThread();
  };

  let scrollFrame = 0;
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      updateChapter();
      updateThread();
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", layoutThread, { passive: true });
  addEventListener("load", layoutThread, { once: true });
  updateChapter();
  layoutThread();

  const portalThemes = {
    "portal-christian": ["Faith", "History", "Reflection"],
    "portal-children": ["Wonder", "Adventure", "Learning"],
    "portal-women": ["Courage", "Connection", "Growth"],
    "portal-educational": ["Science", "Making", "Discovery"]
  };
  $$(".portal").forEach((portal) => {
    const key = Object.keys(portalThemes).find((name) => portal.classList.contains(name));
    if (!key || $(".portal-themes", portal)) return;
    const themes = document.createElement("span");
    themes.className = "portal-themes";
    themes.innerHTML = portalThemes[key].map((theme) => `<span>${theme}</span>`).join("");
    portal.appendChild(themes);
  });

  const story = $(".book-story");
  const openingBook = $(".opening-book", story);
  const pillars = $$(".inside-pillars li", story);
  if (story && openingBook && pillars.length) {
    const controls = document.createElement("div");
    controls.className = "manifest-controls";
    controls.setAttribute("aria-label", "Brand principles");
    controls.innerHTML = pillars.map((_, index) =>
      `<button type="button" aria-label="Show principle ${index + 1}">${String(index + 1).padStart(2, "0")}</button>`
    ).join("");
    $(".book-sticky", story)?.appendChild(controls);
    $$("button", controls).forEach((button, index) => button.addEventListener("click", () => {
      const alreadyActive = button.classList.contains("is-active");
      story.classList.toggle("dv-focus-mode", !alreadyActive);
      pillars.forEach((pillar, pillarIndex) => pillar.classList.toggle("is-focus", !alreadyActive && pillarIndex === index));
      $$("button", controls).forEach((item, itemIndex) => item.classList.toggle("is-active", !alreadyActive && itemIndex === index));
      openingBook.classList.remove("dv-page-turn");
      requestAnimationFrame(() => {
        openingBook.classList.add("dv-page-turn");
        setTimeout(() => openingBook.classList.remove("dv-page-turn"), 650);
      });
    }));
  }

  const books = [
    {
      key: "pompeii",
      title: "Pompeii: The Last Day",
      url: "/books/pompeii-the-last-day.html",
      cover: "/books/pompeii-cover.webp",
      visual: "/images/categories/arts-education-card.jpg",
      kicker: "History Hunters · Ages 8+",
      description: "A cinematic visual journey through the final hours of Pompeii.",
      spreads: [
        ["The city before the silence", "Step into Pompeii", "Maps, daily life and visual clues establish the world before Vesuvius changes it forever.", "History becomes memorable when the reader can see where every moment happens."],
        ["The mountain wakes", "The final 24 hours", "A clear timeline combines eyewitness detail, science and story without losing the human scale.", "Follow the evidence, hour by hour."],
        ["What the ash preserved", "Read the ruins", "Objects, streets and homes become evidence that helps young readers reconstruct real lives.", "The past is not distant when every object has a story."]
      ]
    },
    {
      key: "women",
      title: "Women of the Bible for Today",
      url: "/books/women-of-the-bible-for-today.html",
      cover: "/books/women-of-the-bible.webp",
      visual: "/images/categories/spiritual-card.jpg",
      kicker: "Visual Bible study · For women",
      description: "Scripture, reflection and visual storytelling designed for modern life.",
      spreads: [
        ["Ancient story, present courage", "Meet her world", "Historical context and visual detail bring each woman’s choices into focus.", "Understanding her world changes how we understand her courage."],
        ["Then and now", "A life reflected", "The page connects biblical experience with the questions, waiting and calling women know today.", "Her story does not stay in the past."],
        ["Pause and notice", "Make space to reflect", "Thoughtful prompts invite a slower, more personal encounter with the story.", "Not just information—an invitation to look inward."]
      ]
    },
    {
      key: "romantasy",
      title: "The Ultimate Romantasy Yearbook",
      url: "/books/the-ultimate-romantasy-yearbook.html",
      cover: "/books/romantasy-yearbook.webp",
      visual: "/images/categories/romantasy-card.jpg",
      kicker: "Romantasy · 2005–2026 edition",
      description: "A visual celebration of the books, tropes and obsessions readers share.",
      spreads: [
        ["Where magic meets longing", "Enter the genre", "A bold visual introduction maps the ingredients that make fantasy romance irresistible.", "Every beloved world begins with a promise."],
        ["The tropes readers know", "Choose your obsession", "Enemies, fated mates and forbidden power become a playful field guide for readers.", "Name the trope. Remember the feeling."],
        ["A shelf through time", "The books that shaped it", "A year-by-year journey captures how romantasy grew into a global reading culture.", "A keepsake for the stories that stayed with us."]
      ]
    }
  ];

  const previewModal = document.createElement("div");
  previewModal.className = "dv-modal";
  previewModal.setAttribute("aria-hidden", "true");
  previewModal.innerHTML = `
    <section class="dv-dialog preview-dialog" role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <button class="dv-close" type="button" aria-label="Close preview">×</button>
      <div class="preview-head"><span></span><h2 id="preview-title"></h2><p></p></div>
      <div class="preview-stage">
        <button class="preview-arrow preview-prev" type="button" aria-label="Previous spread">←</button>
        <div class="preview-spread" aria-live="polite"></div>
        <button class="preview-arrow preview-next" type="button" aria-label="Next spread">→</button>
      </div>
      <div class="preview-footer"><div class="preview-dots" aria-label="Choose preview spread"></div><a class="preview-detail" href="#">Explore full book →</a></div>
    </section>`;
  document.body.appendChild(previewModal);

  let activeBook = books[0];
  let activeSpread = 0;
  const renderPreview = () => {
    const spread = activeBook.spreads[activeSpread];
    $(".preview-head span", previewModal).textContent = activeBook.kicker;
    $("#preview-title", previewModal).textContent = activeBook.title;
    $(".preview-head p", previewModal).textContent = activeBook.description;
    $(".preview-spread", previewModal).innerHTML = `
      <div class="preview-page visual" style="background-image:url('${activeBook.visual}')"><strong>${spread[0]}</strong></div>
      <div class="preview-page copy"><small>Look closer · ${String(activeSpread + 1).padStart(2, "0")}</small><h3>${spread[1]}</h3><p>${spread[2]}</p><i>${spread[3]}</i></div>`;
    $(".preview-dots", previewModal).innerHTML = activeBook.spreads.map((_, index) =>
      `<button type="button" class="${index === activeSpread ? "is-active" : ""}" aria-label="Show spread ${index + 1}"></button>`
    ).join("");
    $$(".preview-dots button", previewModal).forEach((button, index) => button.addEventListener("click", () => {
      activeSpread = index;
      renderPreview();
    }));
    $(".preview-detail", previewModal).href = activeBook.url;
  };

  const openModal = (modal) => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("dv-modal-open");
    setTimeout(() => $(".dv-close", modal)?.focus(), 50);
  };
  const closeModal = (modal) => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("dv-modal-open");
  };
  $(".dv-close", previewModal).addEventListener("click", () => closeModal(previewModal));
  previewModal.addEventListener("click", (event) => {
    if (event.target === previewModal) closeModal(previewModal);
  });
  $(".preview-prev", previewModal).addEventListener("click", () => {
    activeSpread = (activeSpread + activeBook.spreads.length - 1) % activeBook.spreads.length;
    renderPreview();
  });
  $(".preview-next", previewModal).addEventListener("click", () => {
    activeSpread = (activeSpread + 1) % activeBook.spreads.length;
    renderPreview();
  });

  $$(".book-card").forEach((card, index) => {
    const book = books[index];
    if (!book || card.parentElement?.classList.contains("book-card-shell")) return;
    const shell = document.createElement("div");
    shell.className = "book-card-shell";
    card.before(shell);
    shell.appendChild(card);
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "preview-trigger";
    trigger.textContent = "Look inside";
    trigger.addEventListener("click", () => {
      activeBook = book;
      activeSpread = 0;
      renderPreview();
      openModal(previewModal);
    });
    shell.appendChild(trigger);

    const cover = $(".display-cover", card);
    if (cover && matchMedia("(pointer:fine)").matches) {
      card.addEventListener("pointermove", (event) => {
        if (reduced.matches) return;
        const rect = cover.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        cover.style.setProperty("--tilt-y", `${(x - .5) * 12}deg`);
        cover.style.setProperty("--tilt-x", `${(.5 - y) * 8}deg`);
      });
      card.addEventListener("pointerleave", () => {
        cover.style.setProperty("--tilt-y", "0deg");
        cover.style.setProperty("--tilt-x", "0deg");
      });
    }
  });

  const finder = document.createElement("div");
  finder.className = "dv-modal";
  finder.setAttribute("aria-hidden", "true");
  finder.innerHTML = `
    <section class="dv-dialog finder-panel" role="dialog" aria-modal="true" aria-labelledby="finder-title">
      <button class="dv-close" type="button" aria-label="Close book finder">×</button>
      <div class="finder-content"></div>
    </section>`;
  document.body.appendChild(finder);

  const finderSteps = [
    {
      title: "Who are you choosing for?",
      options: [["A curious child", "child"], ["A woman of faith", "faith"], ["A history lover", "history"], ["A book-obsessed friend", "romantasy"]]
    },
    {
      title: "What should the book feel like?",
      options: [["An adventure", "adventure"], ["A meaningful pause", "reflection"], ["A discovery", "discovery"], ["A beautiful keepsake", "keepsake"]]
    }
  ];
  let finderStep = 0;
  let finderAnswers = [];
  const chooseRecommendation = () => {
    const joined = finderAnswers.join(" ");
    if (/faith|reflection/.test(joined)) return books[1];
    if (/romantasy|keepsake/.test(joined)) return books[2];
    return books[0];
  };
  const renderFinder = () => {
    const content = $(".finder-content", finder);
    if (finderStep >= finderSteps.length) {
      const book = chooseRecommendation();
      content.innerHTML = `
        <span class="finder-kicker">Your next world</span>
        <div class="finder-result">
          <img src="${book.cover}" alt="${book.title} book cover">
          <div><h3>${book.title}</h3><p>${book.description}</p><a href="${book.url}">Explore this book →</a></div>
        </div>
        <button class="finder-back" type="button">← Start again</button>`;
      $(".finder-back", content).addEventListener("click", () => {
        finderStep = 0;
        finderAnswers = [];
        renderFinder();
      });
      return;
    }
    const step = finderSteps[finderStep];
    content.innerHTML = `
      <span class="finder-kicker">Find your next book · 0${finderStep + 1} / 02</span>
      <h2 id="finder-title">${step.title}</h2>
      <p>Two quick choices. One thoughtful recommendation.</p>
      <div class="finder-progress" style="--finder-progress:${(finderStep + 1) / finderSteps.length * 100}%"><i></i></div>
      <div class="finder-options">${step.options.map(([label, value]) => `<button type="button" data-value="${value}">${label}</button>`).join("")}</div>
      ${finderStep ? '<button class="finder-back" type="button">← Previous question</button>' : ""}`;
    $$(".finder-options button", content).forEach((button) => button.addEventListener("click", () => {
      finderAnswers[finderStep] = button.dataset.value;
      finderStep += 1;
      renderFinder();
    }));
    $(".finder-back", content)?.addEventListener("click", () => {
      finderStep = Math.max(0, finderStep - 1);
      renderFinder();
    });
  };
  renderFinder();
  $(".dv-close", finder).addEventListener("click", () => closeModal(finder));
  finder.addEventListener("click", (event) => {
    if (event.target === finder) closeModal(finder);
  });

  const finderLinks = [
    $(".hero-actions .text-link"),
    $(".site-header .nav-cta")
  ].filter(Boolean);
  finderLinks.forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    finderStep = 0;
    finderAnswers = [];
    renderFinder();
    openModal(finder);
  }));

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    $$(".dv-modal.is-open").forEach(closeModal);
  });
})();
