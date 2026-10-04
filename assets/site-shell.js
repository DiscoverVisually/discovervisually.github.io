(function () {
  const legacyRoutes = new Map([
    ["/books/holy-misconceptions.html", "/books/"],
    ["/books/visual-bible.html", "/books/"],
    ["/books/women-of-the-bible-for-today.html", "/books/"],
    ["/collections/christian/", "/collections/"],
    ["/collections/women/", "/collections/"]
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
    "/books/new-york-city-through-time.html": { title:"New York City", collection:"Cities Through Time", url:"/collections/cities-through-time/" },
    "/books/cut-open.html": { title:"CUT OPEN!", collection:"Visual Learning", url:"/collections/visual-learning/" },
    "/books/pompeii-the-last-day.html": { title: "Pompeii", collection: "History Hunters", url: "/collections/history/" },
    "/books/hindenburg-the-final-flight.html": { title: "Hindenburg", collection: "History Hunters", url: "/collections/history/" },
    "/books/i-worked-for-abraham-lincoln.html": { title: "Abraham Lincoln", collection: "History Hunters", url: "/collections/history/" },
    "/books/i-worked-at-alcatraz.html": { title: "Alcatraz", collection: "History Hunters", url: "/collections/history/" },
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
    if (panel) panel.innerHTML = `<div class="dv-explore-group"><small>Browse</small><a href="/collections/history/">History Hunters</a><a href="/collections/cities-through-time/">Cities Through Time</a><a href="/collections/children/">For Children</a><a href="/collections/romantasy/">Romantasy</a><a href="/collections/visual-learning/">Visual Learning</a><a href="/books/">All books</a></div><div class="dv-explore-group"><small>Featured books</small><a href="/books/new-york-city-through-time.html">New York City Through Time</a><a href="/books/cut-open.html">CUT OPEN!</a><a href="/books/the-ultimate-romantasy-yearbook.html">Romantasy Yearbook</a><a href="/books/pompeii-the-last-day.html">Pompeii</a><a href="/books/hindenburg-the-final-flight.html">Hindenburg</a><a href="/books/i-worked-for-abraham-lincoln.html">Abraham Lincoln</a></div>`;
  }

  document.querySelectorAll(".dv-footer-group").forEach((group) => {
    const label = group.querySelector("small")?.textContent.trim().toLowerCase();
    if (label === "explore") group.innerHTML = `<small>Explore</small><a href="/books/">All books</a><a href="/collections/history/">History Hunters</a><a href="/collections/cities-through-time/">Cities Through Time</a><a href="/collections/children/">For Children</a><a href="/collections/romantasy/">Romantasy</a><a href="/collections/visual-learning/">Visual Learning</a>`;
  });

  if (!header) return;
  const button = header.querySelector("[data-dv-menu]");
  const nav = header.querySelector("[data-dv-nav]");
  const explore = header.querySelector(".dv-explore");
  const closeMenu = (restoreFocus = false) => { if (!button || !nav) return; button.setAttribute("aria-expanded", "false"); nav.removeAttribute("data-open"); document.documentElement.style.overflow = ""; if (explore) explore.open = false; if (restoreFocus) button.focus(); };
  button?.addEventListener("click", () => { const open = button.getAttribute("aria-expanded") !== "true"; button.setAttribute("aria-expanded", String(open)); nav.toggleAttribute("data-open", open); document.documentElement.style.overflow = open ? "hidden" : ""; });
  nav?.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(false); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && nav?.hasAttribute("data-open")) closeMenu(true); });
  window.addEventListener('resize',()=>{if(innerWidth>800&&nav?.hasAttribute('data-open'))closeMenu();});
  document.addEventListener("click", (event) => { if (explore?.open && !explore.contains(event.target)) explore.open = false; });
  const path = location.pathname.replace(/index\.html$/, "");
  header.querySelectorAll("a").forEach((link) => { const target = new URL(link.href, location.origin).pathname.replace(/index\.html$/, ""); if (target === path) link.setAttribute("aria-current", "page"); else if (link.getAttribute("aria-current") === "page") link.removeAttribute("aria-current"); });
})();

document.addEventListener("keydown", (event) => {
 const explore = document.querySelector(".dv-explore");
 if (event.key === "Escape" && explore?.open) { explore.open = false; explore.querySelector("summary")?.focus(); }
});

document.querySelectorAll(".dv-explore-panel a").forEach(link => link.setAttribute("aria-label", link.textContent.trim()));

// Shared motion keeps the existing page entrypoint and static navigation.
import("/assets/editorial-motion.js?v=20261001motion2").catch(() => {});

// Keep shared buying behavior outside the individual book scripts.
Promise.resolve(window.DV_SHELF_STORIES || import('/assets/shelf-stories.js?v=20261001mobile1'))
  .then(() => Promise.all([import('/assets/commerce-metrics.js?v=20261001mobile1'),import('/assets/book-commerce.js?v=20261001mobile1')]))
  .catch(error => console.warn('Book commerce enhancement unavailable:',error.message));

// A single header changes from the publishing house to the current book.
(() => {
  const header=document.querySelector('[data-dv-header]');
  if(!header)return;
  const nav=header.querySelector('[data-dv-nav]');
  const approach=nav?.querySelector('a[href="/about/#approach"]');approach?.remove();
  const studio=nav?.querySelector('a[href="/about/"]');if(studio)studio.textContent='Studio';
  const summary=nav?.querySelector('.dv-explore>summary');if(summary)summary.textContent='Collections';
  const finder=nav?.querySelector('.dv-reader-link');if(finder){finder.textContent='Find your book';finder.href='/#shelf-gift';}
  const hero=document.querySelector('.pm-hero,.az-hero,.ry-hero');
  if(!hero||!document.body.dataset.bookId)return;
  const desktop=matchMedia('(min-width:1051px)');
  const oldNav=document.querySelector('.pm-sticky-nav,.az-book-nav,.ry-book-nav');
  if(!oldNav)return;
  const book=window.DV_BOOKS?.find(item=>item.id===document.body.dataset.bookId);
  const links=document.createElement('nav');links.className='dv-book-header-links';links.setAttribute('aria-label','Current book navigation');
  const title=document.createElement('a');title.className='dv-book-header-title';title.href='#top';title.textContent=book?.shortTitle||book?.title||'Back to book';links.append(title);
  for(const [hash,label] of [['#explore-the-story','Story'],['#inside','Inside'],['#details','Details']]){
    if(!document.querySelector(hash))continue;
    const link=document.createElement('a');link.href=hash;link.textContent=label;links.append(link);
  }
  const amazon=oldNav.querySelector('a[href*="amazon."]');if(amazon){const buy=amazon.cloneNode(true);buy.className='dv-book-header-buy';buy.dataset.commercePlacement='desktop_header';links.append(buy);}
  header.append(links);
  const intro=document.createElement('section');intro.className='dv-book-introduction';intro.setAttribute('aria-label','About the book');hero.after(intro);
  const items=[...hero.querySelectorAll('.pm-deck,.az-deck,.ry-deck,.dv-hero-benefits')].map(element=>{const marker=document.createComment('Hero supporting copy');element.before(marker);return {element,marker};});
  function update(){
    document.body.classList.toggle('dv-book-desktop',desktop.matches);
    items.forEach(({element,marker})=>{if(desktop.matches){if(element.parentNode!==intro)intro.append(element);}else if(element.previousSibling!==marker)marker.after(element);});
    document.body.classList.toggle('dv-book-scrolled',desktop.matches&&hero.getBoundingClientRect().bottom<90);
  }
  let scheduled=false;const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;update();});}};
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);desktop.addEventListener('change',update);update();
})();
