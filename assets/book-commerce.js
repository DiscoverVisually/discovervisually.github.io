/* A single thumb-friendly purchase surface for book pages and the living shelf. */
(() => {
  if (document.querySelector('[data-mobile-purchase]')) return;
  const shelf = document.querySelector('[data-living-shelf]');
  const pageBook = (window.DV_BOOKS || []).find(book => book.id === document.body.dataset.bookId);
  if (!shelf && !pageBook) return;
  const mobile = matchMedia('(max-width: 720px)');
  const bar = document.createElement('aside');
  bar.className = 'dv-mobile-purchase';
  bar.dataset.mobilePurchase = '';
  bar.setAttribute('aria-label', 'Selected book purchase');
  bar.hidden = true;
  bar.innerHTML = '<img alt="" width="32" height="44"><div><strong></strong><small></small></div><a target="_blank" rel="noopener noreferrer" data-commerce-placement="mobile_bar"><span>View on Amazon</span><b aria-hidden="true">↗</b></a>';
  document.body.append(bar);
  document.body.classList.add('dv-commerce-ready');
  let book = null, primary = null, pending = false;
  const final = document.querySelector('.pm-final,.az-final,.ry-final');
  function choose() {
    book = shelf ? window.DVShelf?.getState().book : pageBook;
    primary = shelf?.querySelector('[data-shelf-amazon]') || document.querySelector('.dv-amazon-hero');
    if (book) {
      bar.dataset.bookId = book.id;
      bar.querySelector('img').src = book.cover;
      bar.querySelector('strong').textContent = book.shortTitle || book.title;
      bar.querySelector('small').textContent = book.audience + ' · Paperback';
      const link = bar.querySelector('a');
      link.href = book.amazon;
      link.setAttribute('aria-label', 'View ' + book.title + ' on Amazon (opens in a new tab)');
    }
    update();
  }
  function update() {
    pending = false;
    const rect = primary?.getBoundingClientRect();
    const height = window.visualViewport?.height || innerHeight;
    const primaryVisible = rect && rect.bottom > 0 && rect.top < height - 8;
    const end = final?.getBoundingClientRect();
    const finalCTA = final?.querySelector('a[href*="amazon.com"]')?.getBoundingClientRect();
    const finalVisible = end && finalCTA && finalCTA.top < height && finalCTA.bottom > 0;
    const editing = document.activeElement?.matches('input:not([readonly]),textarea,[contenteditable="true"]');
    const keyboard = editing && window.visualViewport && innerHeight - height > 120;
    const modal = document.querySelector('dialog[open]') || document.body.matches('.pm-modal-open,.shelf-preview-open,.pm-menu-open')
      || document.querySelector('[data-navigation][data-open],[data-dv-nav][data-open]');
    const visible = mobile.matches && !!book?.amazon && !primaryVisible && !finalVisible && !modal && !keyboard;
    bar.hidden = !visible;
    document.body.classList.toggle('dv-purchase-visible', visible);
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('scroll', schedule);
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', schedule);
  mobile.addEventListener('change', schedule);
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['open','data-open'] });
  shelf?.addEventListener('shelfchange', choose);
  choose();

  if (pageBook) document.querySelectorAll('.az-spread-dialog,.ry-spread-dialog').forEach(dialog => {
    if (dialog.querySelector('a[href*="amazon.com"]')) return;
    const link=document.createElement('a');link.className='dv-dialog-amazon';
    link.href=pageBook.amazon;link.target='_blank';link.rel='noopener noreferrer';
    link.dataset.commercePlacement='sample';link.textContent='View on Amazon ↗';
    dialog.append(link);
  });

  // The shelf reader uses split visual halves; this opens the original whole spread.
  const preview = document.querySelector('[data-shelf-preview]');
  if (preview) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'dv-sample-enlarge';
    button.textContent = 'Enlarge spread'; button.dataset.sampleEnlarge = '';
    const originalSpread=preview.querySelector('[data-preview-right]');
    const availability=()=>{button.disabled=!originalSpread?.getAttribute('src');};
    availability();
    if(originalSpread)new MutationObserver(availability).observe(originalSpread,{attributes:true,attributeFilter:['src']});
    preview.querySelector('.shelf-preview-footer')?.prepend(button);
    const dialog = document.createElement('dialog');
    dialog.className = 'dv-sample-dialog';
    dialog.setAttribute('aria-label', 'Full-size book sample');
    dialog.innerHTML = '<div class="dv-sample-toolbar"><strong>Real pages from the book</strong><button type="button" data-sample-zoom aria-pressed="false">Zoom in</button><button type="button" data-sample-close aria-label="Close full-size sample">Close ×</button></div><div class="dv-sample-scroll"><img alt=""></div>';
    document.body.append(dialog);
    button.addEventListener('click', () => {
      const original = preview.querySelector('[data-preview-right]');
      const image = dialog.querySelector('img'); image.src = original.src; image.alt = original.alt;
      dialog.showModal();
    });
    const zoom = dialog.querySelector('[data-sample-zoom]');
    zoom.addEventListener('click', () => {
      const enlarged = zoom.getAttribute('aria-pressed') !== 'true';
      zoom.setAttribute('aria-pressed', String(enlarged));zoom.textContent = enlarged ? 'Fit spread' : 'Zoom in';
      dialog.classList.toggle('is-zoomed', enlarged);
    });
    dialog.querySelector('[data-sample-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      dialog.classList.remove('is-zoomed');zoom.setAttribute('aria-pressed','false');zoom.textContent='Zoom in';
      if (preview.open) button.focus({preventScroll:true});
    });
  }
})();
