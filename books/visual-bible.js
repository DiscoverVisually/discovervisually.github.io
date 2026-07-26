(() => {
  const previews = {
    overview: {
      number: "01",
      label: "The big picture",
      title: "See how the whole Bible fits together.",
      detail: "OLD TESTAMENT · NEW TESTAMENT · ONE CONNECTED STORY",
      copy: "A visual route through the structure, books and central story of Scripture—without beginning with a wall of text.",
      className: "preview-overview",
    },
    timeline: {
      number: "02",
      label: "Timelines",
      title: "Place people and events in time.",
      detail: "CREATION · KINGDOMS · GOSPELS · EARLY CHURCH",
      copy: "Biblical and church-history timelines turn scattered names and dates into a sequence you can actually follow.",
      className: "preview-timeline",
    },
    temple: {
      number: "03",
      label: "Sacred spaces",
      title: "Step inside the First Temple.",
      detail: "OUTER COURT · HOLY PLACE · HOLY OF HOLIES",
      copy: "Isometric reconstructions translate biblical descriptions into spaces—from the Outer Court to the Holy of Holies.",
      className: "preview-temple",
    },
    map: {
      number: "04",
      label: "Holy Land",
      title: "Understand where the story happened.",
      detail: "LAND · JOURNEYS · CITIES · CONTEXT",
      copy: "Geographical guides add the mountains, seas, cities and journeys that are easy to lose when Scripture is read without a map.",
      className: "preview-map",
    },
  };

  const stage = document.querySelector(".vb-book-stage");
  const book = document.querySelector(".vb-book");
  const hint = document.querySelector(".vb-book-hint");
  const openLabel = document.querySelector(".vb-open-label");

  const setBookOpen = (open) => {
    stage?.classList.toggle("is-open", open);
    book?.setAttribute("aria-pressed", String(open));
    book?.setAttribute("aria-label", open ? "Close book preview" : "Open book preview");
    if (hint) hint.textContent = open ? "Choose a chapter below" : "Click to open";
    if (openLabel) openLabel.textContent = open ? "Close preview" : "Open the book";
  };

  document.querySelectorAll("[data-book-toggle]").forEach((control) => {
    control.addEventListener("click", () => setBookOpen(!stage?.classList.contains("is-open")));
  });

  document.querySelectorAll("[data-preview]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const preview = previews[tab.dataset.preview];
      if (!preview) return;
      document.querySelectorAll("[data-preview]").forEach((item) => {
        item.setAttribute("aria-selected", String(item === tab));
      });
      const spread = document.querySelector(".vb-large-spread");
      if (spread) spread.className = `vb-large-spread ${preview.className}`;
      const inside = document.querySelector(".vb-inside-spread");
      if (inside) inside.className = `vb-inside-spread ${preview.className}`;
      document.querySelectorAll("[data-preview-kicker], .vb-spread-left small").forEach((node) => {
        node.textContent = `${preview.number} · ${preview.label}`;
      });
      document.querySelectorAll("[data-preview-title], .vb-spread-left b").forEach((node) => {
        node.textContent = preview.title;
      });
      document.querySelectorAll("[data-preview-detail], .vb-spread-left > i").forEach((node) => {
        node.textContent = preview.detail;
      });
      const count = document.querySelector("[data-preview-count]");
      const copy = document.querySelector("[data-preview-copy]");
      if (count) count.textContent = `${preview.number} / 04`;
      if (copy) copy.textContent = preview.copy;
      setBookOpen(true);
    });
  });
})();
