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
