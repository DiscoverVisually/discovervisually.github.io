      (() => {
        const title = "Discover Visually — Books Made to Be Explored";
        const description = "Beautifully visual books created to inspire curiosity, faith and imagination.";
        const applyMetadata = () => {
          document.title = title;
          const meta = document.querySelector('meta[name="description"]');
          if (meta) meta.setAttribute("content", description);
        };
        const initCursor = () => {
          if (!matchMedia("(pointer: fine)").matches || document.querySelector(".book-cursor")) return;
          const cursor = document.createElement("div");
          cursor.className = "book-cursor";
          cursor.setAttribute("aria-hidden", "true");
          cursor.textContent = "OPEN";
          document.body.appendChild(cursor);
          document.addEventListener("pointermove", (event) => {
            cursor.style.left = event.clientX + "px";
            cursor.style.top = event.clientY + "px";
            cursor.classList.toggle("is-visible", Boolean(event.target.closest(".float-book")));
          }, { passive: true });
        };
        const initPage = () => {
          if (document.documentElement.dataset.dvFoundationReady) return;
          document.documentElement.dataset.dvFoundationReady = "true";
          const menuButton = document.querySelector(".menu-button");
          const menu = document.querySelector("#primary-nav");
          if (menuButton && menu && !menuButton.dataset.bound) {
            menuButton.dataset.bound = "true";
            const setMenu = (open) => {
              menu.classList.toggle("nav-open", open);
              menuButton.setAttribute("aria-expanded", String(open));
              document.body.classList.toggle("mobile-menu-open", open);
            };
            menuButton.addEventListener("click", () => setMenu(!menu.classList.contains("nav-open")));
            menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
            document.addEventListener("keydown", (event) => {
              if (event.key === "Escape") setMenu(false);
            });
          }

          const story = document.querySelector(".book-story");
          let frame = 0;
          const updateScrollEffects = () => {
            frame = 0;
            document.documentElement.style.setProperty("--page-y", `${window.scrollY}px`);
            if (!story) return;
            const rect = story.getBoundingClientRect();
            const range = Math.max(1, story.offsetHeight - window.innerHeight);
            const progress = Math.min(1, Math.max(0, -rect.top / range));
            story.style.setProperty("--open", progress.toFixed(3));
          };
          const requestScrollUpdate = () => {
            if (!frame) frame = requestAnimationFrame(updateScrollEffects);
          };
          updateScrollEffects();
          addEventListener("scroll", requestScrollUpdate, { passive: true });
          addEventListener("resize", requestScrollUpdate, { passive: true });
        };
        applyMetadata();
        initPage();
        addEventListener("load", () => {
          setTimeout(applyMetadata, 0);
          setTimeout(applyMetadata, 1200);
          setTimeout(initCursor, 800);
          setTimeout(initPage, 0);
        }, { once: true });
      })();
      (() => {
        const start = () => setTimeout(() => {
          const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
          document.querySelectorAll(".portal").forEach((portal) => {
            if (portal.dataset.motionBound) return;
            portal.dataset.motionBound = "true";
            const image = portal.querySelector(".portal-image");
            if (!image) return;
            portal.addEventListener("pointermove", (event) => {
              if (reducedMotion.matches || event.pointerType === "touch") return;
              const rect = portal.getBoundingClientRect();
              const x = (event.clientX - rect.left) / rect.width;
              const y = (event.clientY - rect.top) / rect.height;
              image.style.setProperty("--mx", `${(x - 0.5) * -12}px`);
              image.style.setProperty("--my", `${(y - 0.5) * -10}px`);
              portal.style.setProperty("--glow-x", `${x * 100}%`);
              portal.style.setProperty("--glow-y", `${y * 100}%`);
            });
            portal.addEventListener("pointerleave", () => {
              image.style.setProperty("--mx", "0px");
              image.style.setProperty("--my", "0px");
              portal.style.setProperty("--glow-x", "50%");
              portal.style.setProperty("--glow-y", "42%");
            });
          });
        }, 1200);
        if (document.readyState === "complete") start();
        else window.addEventListener("load", start, { once: true });
      })();
(() => {
  const MOBILE = "(max-width: 760px)";
  const ready = () => {
    if (!matchMedia(MOBILE).matches || document.documentElement.dataset.dvMobileReady) return;
    document.documentElement.dataset.dvMobileReady = "true";

    const header = document.querySelector(".site-header");
    const menu = header?.querySelector("nav");
    const menuButton = header?.querySelector(".menu-button");
    if (menu && menuButton) {
      const syncMenu = () => document.body.classList.toggle("mobile-menu-open", menu.classList.contains("nav-open"));
      menuButton.addEventListener("click", () => requestAnimationFrame(syncMenu));
      menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => document.body.classList.remove("mobile-menu-open")));

      if (!menu.querySelector(".mobile-menu-books")) {
        const shelf = document.createElement("div");
        shelf.className = "mobile-menu-books";
        shelf.innerHTML = `
          <a href="/books/pompeii-the-last-day.html" aria-label="Explore Pompeii"><img src="/books/pompeii-cover.webp" alt=""></a>
          <a href="/books/women-of-the-bible-for-today.html" aria-label="Explore Women of the Bible"><img src="/books/women-of-the-bible.webp" alt=""></a>
          <a href="/books/the-ultimate-romantasy-yearbook.html" aria-label="Explore Romantasy Yearbook"><img src="/books/romantasy-yearbook.webp" alt=""></a>
          <span>Tap a cover</span>`;
        menu.appendChild(shelf);
      }
    }

    const hero = document.querySelector(".hero");
    if (hero && !hero.querySelector(".mobile-tap-hint")) {
      const hint = document.createElement("div");
      hint.className = "mobile-tap-hint";
      hint.textContent = "Tap a cover to explore";
      hero.appendChild(hint);
    }

    const addCarousel = (scroller, total, label) => {
      if (!scroller || scroller.nextElementSibling?.classList.contains("mobile-carousel-meta")) return;
      const meta = document.createElement("div");
      meta.className = "mobile-carousel-meta";
      meta.innerHTML = `<span>${label}</span><span class="carousel-track"><i></i></span><b>01 / ${String(total).padStart(2, "0")}</b>`;
      scroller.after(meta);
      let frame = 0;
      const update = () => {
        frame = 0;
        const items = [...scroller.children];
        const center = scroller.scrollLeft + scroller.clientWidth / 2;
        let active = 0;
        let distance = Infinity;
        items.forEach((item, index) => {
          const itemCenter = item.offsetLeft + item.offsetWidth / 2;
          if (Math.abs(itemCenter - center) < distance) { distance = Math.abs(itemCenter - center); active = index; }
        });
        meta.querySelector("b").textContent = `${String(active + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
        meta.style.setProperty("--carousel-progress", `${((active + 1) / total) * 100}%`);
      };
      scroller.addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
      update();
    };
    addCarousel(document.querySelector(".portal-grid"), 4, "Swipe worlds");
    addCarousel(document.querySelector(".book-gallery"), 3, "Swipe books");

    const story = document.querySelector(".book-story");
    const sticky = story?.querySelector(".book-sticky");
    if (story && sticky && !sticky.querySelector(".mobile-brand-pillars")) {
      const source = story.querySelectorAll(".inside-pillars li");
      const pillars = document.createElement("div");
      pillars.className = "mobile-brand-pillars";
      pillars.innerHTML = `<p>What makes us different</p>${[...source].map((item) => {
        const number = item.querySelector(":scope > span")?.textContent || "";
        const title = item.querySelector("strong")?.textContent || "";
        const copy = item.querySelector("p")?.textContent || "";
        return `<div class="mobile-brand-card"><span>${number}</span><div><strong>${title}</strong><p>${copy}</p></div></div>`;
      }).join("")}<a class="mobile-brand-cta" href="#featured">Explore our books →</a>`;
      sticky.appendChild(pillars);
      const reveal = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) story.classList.add("mobile-open"); });
      }, { threshold: .22 });
      reveal.observe(story);
    }

    if (!document.querySelector(".mobile-conversion-bar")) {
      const bar = document.createElement("a");
      bar.className = "mobile-conversion-bar";
      bar.href = "#featured";
      bar.innerHTML = `<span>Explore the books</span><b>→</b>`;
      document.body.appendChild(bar);
      const sections = [
        [document.querySelector("#worlds"), "Browse the collections", "#worlds"],
        [story, "Explore our books", "#featured"],
        [document.querySelector("#featured"), "View selected books", "#featured"],
        [document.querySelector("#manifesto"), "Meet Discover Visually", "#manifesto"]
      ].filter(([section]) => section);
      const updateBar = () => {
        const heroBottom = hero?.getBoundingClientRect().bottom ?? 1;
        const newsletter = document.querySelector("#newsletter")?.getBoundingClientRect();
        const visible = heroBottom < 0 && (!newsletter || newsletter.top > innerHeight * .72);
        bar.classList.toggle("is-visible", visible);
        let active = sections[0];
        sections.forEach((entry) => { if (entry[0].getBoundingClientRect().top < innerHeight * .48) active = entry; });
        if (active) { bar.querySelector("span").textContent = active[1]; bar.href = active[2]; }
      };
      addEventListener("scroll", updateBar, { passive: true });
      updateBar();
    }
  };

  const start = () => setTimeout(ready, 1350);
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });
})();
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
      visual: "/assets/spread-pompeii.webp",
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
      visual: "/assets/spread-women-of-the-bible.webp",
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
      visual: "/assets/spread-romantasy-yearbook.webp",
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
    <section class="dv-dialog finder-panel" role="dialog" aria-modal="true" aria-labelledby="finder-title" data-mood="welcome">
      <button class="dv-close" type="button" aria-label="Close book finder">×</button>
      <aside class="finder-story" aria-hidden="true">
        <span class="finder-story-mark">DV</span>
        <div class="finder-story-copy">
          <small>Discover Visually</small>
          <p>A book should feel chosen,<br>not simply found.</p>
        </div>
        <div class="finder-story-orbit"></div>
        <span class="finder-story-step">01 <i></i> 02</span>
      </aside>
      <div class="finder-content" aria-live="polite"></div>
    </section>`;
  document.body.appendChild(finder);

  const finderSteps = [
    {
      title: "Who are you choosing for?",
      intro: "Start with the person. We’ll find the world that belongs in their hands.",
      options: [
        ["01", "A curious child", "Wonder, adventure and things worth discovering.", "child"],
        ["02", "A woman of faith", "Reflection, courage and stories with meaning.", "faith"],
        ["03", "A history lover", "Real places, evidence and the people who lived it.", "history"],
        ["04", "A book-obsessed friend", "A beautiful keepsake for a life built around stories.", "romantasy"]
      ]
    },
    {
      title: "What should it leave behind?",
      intro: "Choose the feeling they should carry after the last page.",
      options: [
        ["01", "A sense of adventure", "Something vivid enough to step inside.", "adventure"],
        ["02", "A meaningful pause", "A quieter book that stays in the mind.", "reflection"],
        ["03", "A new discovery", "The pleasure of finally seeing how it all connects.", "discovery"],
        ["04", "A beautiful keepsake", "A book made to revisit, display and give.", "keepsake"]
      ]
    }
  ];
  const holyMisconceptions = {
    key: "holy",
    title: "Holy Misconceptions!",
    url: "/books/holy-misconceptions.html",
    cover: "/books/holy-misconceptions-cover.webp",
    kicker: "Biblical myths · Visual investigation",
    description: "A curious, case-file journey through the biblical stories we think we know."
  };
  let finderStep = 0;
  let finderAnswers = [];
  const chooseRecommendation = () => {
    const [reader, feeling] = finderAnswers;
    if (reader === "faith" && feeling === "discovery") return holyMisconceptions;
    if (reader === "faith" || feeling === "reflection") return books[1];
    if (reader === "romantasy" || feeling === "keepsake") return books[2];
    return books[0];
  };
  const renderFinder = () => {
    const content = $(".finder-content", finder);
    const panel = $(".finder-panel", finder);
    if (finderStep >= finderSteps.length) {
      const book = chooseRecommendation();
      panel.dataset.mood = book.key;
      $(".finder-story-step", finder).innerHTML = "YOUR <i></i> BOOK";
      content.innerHTML = `
        <div class="finder-result-head">
          <span class="finder-kicker">Your next world</span>
          <span class="finder-match">A thoughtful match</span>
        </div>
        <div class="finder-result">
          <div class="finder-result-cover"><img src="${book.cover}" alt="${book.title} book cover"></div>
          <div class="finder-result-copy">
            <small>${book.kicker}</small>
            <h3>${book.title}</h3>
            <p>${book.description}</p>
            <a href="${book.url}">Explore this book <b>↗</b></a>
          </div>
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
    panel.dataset.mood = finderStep ? (finderAnswers[0] || "welcome") : "welcome";
    $(".finder-story-step", finder).innerHTML = `0${finderStep + 1} <i></i> 02`;
    content.innerHTML = `
      <span class="finder-kicker">A two-question book finder · 0${finderStep + 1} / 02</span>
      <h2 id="finder-title">${step.title}</h2>
      <p>${step.intro}</p>
      <div class="finder-options">${step.options.map(([number, label, description, value]) => `
        <button type="button" data-value="${value}">
          <span>${number}</span>
          <span><b>${label}</b><small>${description}</small></span>
          <i>↗</i>
        </button>`).join("")}</div>
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
    $(".hero-actions .text-link")
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
(() => {
  const spreads = {
    "cover-pompeii": {
      src: "/assets/spread-pompeii.webp",
      alt: "Interior spread from Pompeii: The Last Day showing the eruption of Vesuvius"
    },
    "cover-women": {
      src: "/assets/spread-women-of-the-bible.webp",
      alt: "Interior spread from Women of the Bible for Today featuring Ruth"
    },
    "cover-romantasy": {
      src: "/assets/spread-romantasy-yearbook.webp",
      alt: "Interior spread from The Ultimate Romantasy Yearbook about war colleges and dragon bonds"
    }
  };

  const coarsePointer = matchMedia("(hover: none), (pointer: coarse)");
  const heroBooks = [...document.querySelectorAll(".hero .float-book")];
  if (!heroBooks.length) return;

  const closeBooks = (except = null) => {
    heroBooks.forEach((book) => {
      if (book === except) return;
      book.classList.remove("is-open");
      book.setAttribute("aria-expanded", "false");
    });
  };

  heroBooks.forEach((book) => {
    const key = Object.keys(spreads).find((className) => book.classList.contains(className));
    const cover = book.querySelector(":scope > img");
    if (!key || !cover || book.dataset.openBookReady) return;

    book.dataset.openBookReady = "true";
    book.classList.add("dv-openable");
    book.setAttribute("aria-expanded", "false");

    const spread = document.createElement("span");
    spread.className = "hero-book-spread";
    spread.setAttribute("aria-hidden", "true");
    spread.innerHTML = `<img src="${spreads[key].src}" alt="${spreads[key].alt}" loading="lazy" decoding="async">`;

    const lid = document.createElement("span");
    lid.className = "hero-cover-lid";
    lid.setAttribute("aria-hidden", "true");
    const back = document.createElement("span");
    back.className = "hero-cover-back";
    lid.append(back, cover);

    book.prepend(spread);
    book.append(lid);

    book.addEventListener("click", (event) => {
      if (!coarsePointer.matches) return;
      if (!book.classList.contains("is-open")) {
        event.preventDefault();
        closeBooks(book);
        book.classList.add("is-open");
        book.setAttribute("aria-expanded", "true");
      }
    });

    book.addEventListener("focus", () => {
      if (coarsePointer.matches) return;
      closeBooks(book);
      book.classList.add("is-open");
      book.setAttribute("aria-expanded", "true");
    });

    book.addEventListener("blur", () => {
      if (coarsePointer.matches) return;
      book.classList.remove("is-open");
      book.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!coarsePointer.matches || event.target.closest(".hero .float-book")) return;
    closeBooks();
  }, { passive: true });

  const hint = document.querySelector(".mobile-tap-hint");
  if (hint) hint.textContent = "Tap to look inside · tap again to explore";

  const warmSpreads = () => {
    Object.values(spreads).forEach(({ src }) => {
      const image = new Image();
      image.src = src;
    });
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(warmSpreads, { timeout: 2200 });
  } else {
    setTimeout(warmSpreads, 1400);
  }
})();
(() => {
  const gallery = document.querySelector(".book-gallery");
  const controls = document.querySelector(".gallery-controls");
  if (!gallery || !controls) return;

  const cards = [...gallery.querySelectorAll(".book-card-shell")];
  const current = controls.querySelector("b");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const nearestCardIndex = () => {
    const galleryCenter = gallery.scrollLeft + gallery.clientWidth / 2;
    let nearest = 0;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const nextDistance = Math.abs(center - galleryCenter);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = index;
      }
    });
    return nearest;
  };

  const updateCount = () => {
    if (current) current.textContent = String(nearestCardIndex() + 1).padStart(2, "0");
  };

  const move = (direction) => {
    const next = Math.max(0, Math.min(cards.length - 1, nearestCardIndex() + direction));
    cards[next]?.scrollIntoView({
      behavior: reduced.matches ? "auto" : "smooth",
      block: "nearest",
      inline: "center"
    });
  };

  controls.querySelector(".gallery-prev")?.addEventListener("click", () => move(-1));
  controls.querySelector(".gallery-next")?.addEventListener("click", () => move(1));
  gallery.addEventListener("scroll", () => requestAnimationFrame(updateCount), { passive: true });
  addEventListener("resize", updateCount, { passive: true });
  updateCount();
})();
