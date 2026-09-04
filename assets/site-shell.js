(function () {
  const legacyRoutes = new Map([
    ["/books/holy-misconceptions.html", "/books/"],
    ["/books/visual-bible.html", "/books/"],
    ["/books/women-of-the-bible-for-today.html", "/books/"],
    ["/collections/christian/", "/collections/"],
    ["/collections/women/", "/collections/"],
    ["/collections/visual-learning/", "/collections/"]
  ]);

  document.querySelectorAll("a[href]").forEach((link) => {
    const raw = link.getAttribute("href");
    if (raw === "/#reader-list") link.setAttribute("href", "/reader-list/");
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("http")) return;
    const url = new URL(raw, location.origin);
    const replacement = legacyRoutes.get(url.pathname);
    if (replacement) link.setAttribute("href", replacement);
  });

  const bookTitles = {
    "/books/pompeii-the-last-day.html": { title: "Pompeii", collection: "History", url: "/collections/history/" },
    "/books/hindenburg-the-final-flight.html": { title: "Hindenburg", collection: "History", url: "/collections/history/" },
    "/books/i-worked-for-abraham-lincoln.html": { title: "Abraham Lincoln", collection: "History", url: "/collections/history/" },
    "/books/the-ultimate-romantasy-yearbook.html": { title: "Romantasy Yearbook", collection: "Romantasy", url: "/collections/romantasy/" }
  };
  if (bookTitles[location.pathname]) {
    const book = bookTitles[location.pathname];
    const breadcrumb = document.querySelector(".dv-breadcrumb");
    if (breadcrumb) breadcrumb.innerHTML = `<a class="dv-crumb-home" href="/">Home</a><i>/</i><a href="${book.url}">${book.collection}</a><i>/</i><span aria-current="page">${book.title}</span>`;
  }

  const header = document.querySelector("[data-dv-header]");
  if (header) {
    const panel = header.querySelector(".dv-explore-panel");
    if (panel) panel.innerHTML = `<div class="dv-explore-group"><small>Browse</small><a href="/collections/children/">For Children</a><a href="/collections/history/">History</a><a href="/collections/romantasy/">Romantasy</a><a href="/collections/">All collections</a></div><div class="dv-explore-group"><small>Featured books</small><a href="/books/the-ultimate-romantasy-yearbook.html">Romantasy Yearbook</a><a href="/books/pompeii-the-last-day.html">Pompeii</a><a href="/books/hindenburg-the-final-flight.html">Hindenburg</a><a href="/books/i-worked-for-abraham-lincoln.html">Abraham Lincoln</a></div>`;
  }

  document.querySelectorAll(".dv-footer-group").forEach((group) => {
    const label = group.querySelector("small")?.textContent.trim().toLowerCase();
    if (label === "explore") group.innerHTML = `<small>Explore</small><a href="/books/">All books</a><a href="/collections/history/">History</a><a href="/collections/children/">For Children</a><a href="/collections/romantasy/">Romantasy</a>`;
  });

  if (!header) return;
  const button = header.querySelector("[data-dv-menu]");
  const nav = header.querySelector("[data-dv-nav]");
  const explore = header.querySelector(".dv-explore");
  const closeMenu = (restoreFocus = false) => { if (!button || !nav) return; button.setAttribute("aria-expanded", "false"); nav.removeAttribute("data-open"); document.documentElement.style.overflow = ""; if (explore) explore.open = false; if (restoreFocus) button.focus(); };
  button?.addEventListener("click", () => { const open = button.getAttribute("aria-expanded") !== "true"; button.setAttribute("aria-expanded", String(open)); nav.toggleAttribute("data-open", open); document.documentElement.style.overflow = open ? "hidden" : ""; });
  nav?.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(false); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && nav?.hasAttribute("data-open")) closeMenu(true); });
  document.addEventListener("click", (event) => { if (explore?.open && !explore.contains(event.target)) explore.open = false; });
  const path = location.pathname.replace(/index\.html$/, "");
  header.querySelectorAll("a").forEach((link) => { const target = new URL(link.href, location.origin).pathname.replace(/index\.html$/, ""); if (target === path) link.setAttribute("aria-current", "page"); else if (link.getAttribute("aria-current") === "page") link.removeAttribute("aria-current"); });
})();
