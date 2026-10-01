/* Anonymous session counters. No cookies, identifiers or network requests.
   A configured analytics provider can subscribe to dv:commerce events. */
(() => {
  if (window.DVCommerceMetrics) return;
  const key = 'dv-commerce-session-v1';
  let counts = {};
  try { counts = JSON.parse(sessionStorage.getItem(key)) || {}; } catch (_) {}
  function track(event, book, placement, extra = {}) {
    if (!book?.id) return;
    const detail = { event, book: book.id, placement, ...extra };
    const counter = [event, book.id, placement].join(':');
    counts[counter] = (counts[counter] || 0) + 1;
    try { sessionStorage.setItem(key, JSON.stringify(counts)); } catch (_) {}
    window.dispatchEvent(new CustomEvent('dv:commerce', { detail }));
  }
  window.DVCommerceMetrics = {
    track,
    snapshot: () => ({ ...counts }),
    subscribe(listener) {
      const handler = event => listener(event.detail);
      window.addEventListener('dv:commerce', handler);
      return () => window.removeEventListener('dv:commerce', handler);
    }
  };
  const books = () => window.DV_BOOKS || [];
  function context(element) {
    const scope = element.closest('[data-book-id]');
    const id = scope?.dataset.bookId || document.body.dataset.bookId;
    const book = books().find(item => item.id === id)
      || (element.closest('[data-shelf-preview]') ? books().find(item => item.amazon === document.querySelector('[data-preview-amazon]')?.href) : null)
      || (element.closest('[data-living-shelf]') ? window.DVShelf?.getState().book : null);
    const placement = element.dataset.commercePlacement
      || (element.closest('.dv-mobile-purchase') ? 'mobile_bar'
        : element.closest('[data-shelf-preview],dialog') ? 'sample'
          : element.closest('[data-living-shelf]') ? 'shelf'
            : element.closest('.dv-catalog-card') ? 'collection'
              : element.closest('.pm-final,.az-final,.ry-final') ? 'final'
                : element.closest('.pm-hero,.az-hero,.ry-hero') ? 'hero' : 'page');
    return { book, placement };
  }
  document.addEventListener('click', event => {
    const element = event.target.closest('a,button');
    if (!element) return;
    const current = context(element);
    const amazon = element.tagName === 'A' && books().find(book => book.amazon === element.href);
    if (amazon) track('amazon_click', amazon, current.placement);
    else if (element.matches('[data-shelf-link],a[href$="#inside"]')) track('sample_open', current.book, current.placement);
    else if (element.matches('[data-preview-next],[data-preview-previous],[data-preview-page],[aria-label="Next spread"],[aria-label="Previous spread"],[data-az-spread-next],[data-az-spread-prev],[data-spread-next],[data-spread-prev]')) track('sample_browse', current.book, current.placement);
  });
  let selected = '';
  document.querySelector('[data-living-shelf]')?.addEventListener('shelfchange', event => {
    const book = event.detail.book;
    if (book && book.id !== selected) { selected = book.id; track('book_select', book, 'shelf'); }
  });
  const pageBook=books().find(book=>book.id===document.body.dataset.bookId);
  if(pageBook)track('book_view',pageBook,'detail');
  const initial=window.DVShelf?.getState().book;
  if(initial){selected=initial.id;track('book_view',initial,'shelf');}
  if(typeof IntersectionObserver==='undefined')return;
  const viewed = new WeakSet();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < .5 || viewed.has(entry.target)) continue;
      viewed.add(entry.target);
      const {book, placement} = context(entry.target);
      track('book_view', book, placement);
    }
  }, { threshold: .5 });
  document.querySelectorAll('.dv-catalog-card,main > .pm-hero,.az-hero,.ry-hero').forEach(element => observer.observe(element));
})();
