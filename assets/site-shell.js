(function () {
  const header = document.querySelector("[data-dv-header]");
  if (!header) return;
  const button = header.querySelector("[data-dv-menu]");
  const nav = header.querySelector("[data-dv-nav]");
  const explore = header.querySelector(".dv-explore");

  document.querySelectorAll('a[href="/#reader-list"]').forEach((link) => {
    link.setAttribute("href", "/reader-list/");
  });

  const closeMenu = (restoreFocus = false) => {
    if (!button || !nav) return;
    button.setAttribute("aria-expanded", "false");
    nav.removeAttribute("data-open");
    document.documentElement.style.overflow = "";
    if (explore) explore.open = false;
    if (restoreFocus) button.focus();
  };

  button?.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    nav.toggleAttribute("data-open", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
  });

  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.hasAttribute("data-open")) closeMenu(true);
  });

  document.addEventListener("click", (event) => {
    if (explore?.open && !explore.contains(event.target)) explore.open = false;
  });

  const path = location.pathname.replace(/index\.html$/, "");
  header.querySelectorAll("a[data-dv-path]").forEach((link) => {
    const target = new URL(link.href, location.origin).pathname.replace(/index\.html$/, "");
    if (target === path) link.setAttribute("aria-current", "page");
  });
})();
