(() => {
  if (document.documentElement.dataset.dvPolishReady) return;
  document.documentElement.dataset.dvPolishReady = "true";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const catalog = [
    {
      detail: "/books/pompeii-the-last-day.html",
      facts: ["Ages 8–12", "Full color", "US Letter", "History + science"],
      availability: "Coming soon",
      live: false,
      actionLabel: "Get release updates",
      action: "mailto:hello@discovervisually.com?subject=Pompeii%3A%20The%20Last%20Day%20release%20updates"
    },
    {
      detail: "/books/women-of-the-bible-for-today.html",
      facts: ["12 biblical women", "Full color", "US Letter", "Paperback"],
      availability: "Available now on Amazon",
      live: true,
      actionLabel: "Buy on Amazon ↗",
      action: "https://www.amazon.com/WOMEN-BIBLE-TODAY-Visual-Modern/dp/B0GY3ZJN8S"
    },
    {
      detail: "/books/the-ultimate-romantasy-yearbook.html",
      facts: ["2005–2026", "Full color", "US Letter", "Gift edition"],
      availability: "Coming soon",
      live: false,
      actionLabel: "Get release updates",
      action: "mailto:hello@discovervisually.com?subject=The%20Ultimate%20Romantasy%20Yearbook%20release%20updates"
    }
  ];

  const hero = $(".hero");
  if (hero && !$(".trust-strip")) {
    const strip = document.createElement("aside");
    strip.className = "trust-strip";
    strip.setAttribute("aria-label", "Why readers choose Discover Visually");
    strip.innerHTML = [
      "Independently created",
      "Full-color interiors",
      "Thoughtfully researched",
      "Made for gifting"
    ].map((item) => `<span><i aria-hidden="true"></i>${item}</span>`).join("");
    hero.insertAdjacentElement("afterend", strip);
  }

  const manifestoCopy = $(".manifesto-copy");
  if (manifestoCopy && !$(".studio-note", manifestoCopy)) {
    const link = $(".text-link", manifestoCopy);
    const note = document.createElement("div");
    note.className = "studio-note";
    note.innerHTML = `
      <span class="studio-note-mark" aria-hidden="true">DV</span>
      <div>
        <p>We’re a small independent studio creating the visual books we wish existed.</p>
        <small>Built around curiosity, care and the joy of looking closer</small>
      </div>`;
    if (link) link.before(note);
    else manifestoCopy.appendChild(note);
  }

  const shells = $$(".book-card-shell");
  shells.forEach((shell, index) => {
    const book = catalog[index];
    let card = $(".book-card", shell);
    const meta = card && $(".book-meta", card);
    if (!book || !card || !meta || meta.dataset.polished) return;
    meta.dataset.polished = "true";

    if (card.tagName === "A") {
      const article = document.createElement("article");
      article.className = card.className;
      article.setAttribute("aria-label", card.getAttribute("aria-label") || "Featured book");
      while (card.firstChild) article.appendChild(card.firstChild);
      card.replaceWith(article);
      card = article;
    }

    const description = $(":scope > p:not(.book-eyebrow)", meta);
    const facts = document.createElement("ul");
    facts.className = "book-facts";
    facts.setAttribute("aria-label", "Book details");
    facts.innerHTML = book.facts.map((fact) => `<li>${fact}</li>`).join("");
    description?.insertAdjacentElement("afterend", facts);

    const availability = document.createElement("div");
    availability.className = `availability-line${book.live ? " is-live" : ""}`;
    availability.textContent = book.availability;
    facts.insertAdjacentElement("afterend", availability);

    const actions = $(".book-actions", meta);
    if (actions) {
      const external = book.action.startsWith("http");
      actions.innerHTML = `
        <a href="${book.detail}">Explore book</a>
        <a class="primary-action" href="${book.action}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${book.actionLabel}</a>`;
    }

    const cover = $(".display-cover", card);
    if (cover && matchMedia("(pointer:fine)").matches) {
      card.addEventListener("pointermove", (event) => {
        if (reduced.matches) return;
        const rect = cover.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        cover.style.setProperty("--tilt-y", `${(x - .5) * 10}deg`);
        cover.style.setProperty("--tilt-x", `${(.5 - y) * 7}deg`);
      });
      card.addEventListener("pointerleave", () => {
        cover.style.setProperty("--tilt-y", "0deg");
        cover.style.setProperty("--tilt-x", "0deg");
      });
    }
  });

  const gallery = $(".book-gallery");
  if (gallery && !$(".gallery-nav")) {
    const galleryNav = document.createElement("div");
    galleryNav.className = "gallery-nav";
    galleryNav.setAttribute("aria-label", "Selected books carousel controls");
    galleryNav.innerHTML = `
      <p><span>01</span> / ${String(shells.length).padStart(2, "0")} &nbsp; Selected book</p>
      <div>
        <button type="button" data-direction="-1" aria-label="Previous book">←</button>
        <button type="button" data-direction="1" aria-label="Next book">→</button>
      </div>`;
    gallery.insertAdjacentElement("afterend", galleryNav);

    let active = 0;
    const label = $("p span", galleryNav);
    const go = (next) => {
      active = (next + shells.length) % shells.length;
      shells[active]?.scrollIntoView({
        behavior: reduced.matches ? "auto" : "smooth",
        block: "nearest",
        inline: "center"
      });
      if (label) label.textContent = String(active + 1).padStart(2, "0");
    };
    $$("button", galleryNav).forEach((button) => button.addEventListener("click", () => {
      go(active + Number(button.dataset.direction));
    }));

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        active = Math.max(0, shells.indexOf(visible.target));
        if (label) label.textContent = String(active + 1).padStart(2, "0");
      }, { root: gallery, threshold: [.45, .7] });
      shells.forEach((shell) => observer.observe(shell));
    }
  }

  $$(".chapter-nav button").forEach((button) => {
    const label = $("b", button)?.textContent?.trim();
    if (label) button.title = label;
  });
})();
