/* One opening choreography shared by every active book detail page. */
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map();
  const clamp = value => Math.max(0, Math.min(1, value));
  const smoother = value => { const x = clamp(value); return x * x * x * (x * (x * 6 - 15) + 10); };
  const phase = (time, start, end) => smoother((time - start) / (end - start));

  function pose(root, time) {
    const t = clamp(time);
    const body = phase(t, 0, 1);
    const cover = phase(t, .06, .82);
    const pages = phase(t, .25, .91);
    const lift = Math.sin(Math.PI * phase(t, 0, .97));
    const values = {
      '--pm-open-progress': body,
      '--pm-cover-progress': cover,
      '--pm-rear-reveal': pages,
      '--pm-left-reveal': pages,
      '--dv-open-lift': lift,
      '--dv-open-page-angle': 168 * (1 - pages),
      '--dv-open-shade': Math.sin(Math.PI * cover) * .52,
      '--dv-open-page-shade': Math.sin(Math.PI * pages) * .36
    };
    for (const [name, value] of Object.entries(values)) root.style.setProperty(name, value.toFixed(5));
    root.classList.toggle('has-visible-pages', cover > .12);
    root.classList.toggle('is-cover-behind', cover > .93);
  }

  function start(root, { onComplete = () => {} } = {}) {
    if (running.has(root)) return;
    root.classList.add('dv-book-opening', 'is-opening');
    const duration = matchMedia('(max-width: 720px)').matches ? 1100 : 1500;
    let frame = 0;
    let elapsed = 0;
    let previous = null;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      pose(root, 1);
      root.classList.remove('is-opening');
      root.classList.add('is-open');
      root.dataset.openingState = 'open';
      running.delete(root);
      document.removeEventListener('visibilitychange', resume);
      reducedMotion.removeEventListener('change', motionChange);
      onComplete();
    };
    const tick = now => {
      if (document.hidden) { previous = null; return; }
      if (previous !== null) elapsed += Math.min(now - previous, 64);
      previous = now;
      pose(root, elapsed / duration);
      if (elapsed >= duration) finish();
      else frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      previous = null;
      if (!document.hidden && !finished) frame = requestAnimationFrame(tick);
    };
    const motionChange = () => { if (reducedMotion.matches) finish(); };
    running.set(root, finish);
    root.dataset.openingState = 'opening';
    document.addEventListener('visibilitychange', resume);
    reducedMotion.addEventListener('change', motionChange);
    if (reducedMotion.matches) finish();
    else frame = requestAnimationFrame(tick);
  }

  function observe(root, shell, open) {
    if (!('IntersectionObserver' in window)) { open(); return; }
    // Watch the book itself, rather than a tall surrounding section.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= .65) { observer.disconnect(); open(); }
    }, { threshold: [0, .65] });
    observer.observe(shell);
  }

  window.DVBookOpening = { pose, start, observe, finish: root => running.get(root)?.() };

  // The two editorial galleries keep their existing controls and full-spread
  // image. Split visual halves add the same physical opening without changing
  // their gallery data, keyboard handling or fullscreen dialogs.
  for (const [selector, coverURL] of [
    ['.az-viewer-stage', '/books/alcatraz-cover.webp'],
    ['.ry-viewer-stage', '/books/romantasy-yearbook-2x3.webp']
  ]) {
    const stage = document.querySelector(selector);
    const image = stage?.querySelector('img');
    if (!stage || !image) continue;
    stage.classList.add('dv-flat-opening', 'dv-book-opening');
    const book = document.createElement('div');
    book.className = 'dv-opening-book';
    book.innerHTML = `<div class="dv-opening-rear" aria-hidden="true"></div><div class="dv-opening-left" aria-hidden="true"><img alt=""></div><div class="dv-opening-right"></div><div class="dv-opening-gutter" aria-hidden="true"></div><div class="dv-opening-cover" aria-hidden="true"><div class="dv-opening-cover-front"><img src="${coverURL}" alt=""></div><div class="dv-opening-cover-back"></div></div>`;
    stage.insertBefore(book, image);
    book.querySelector('.dv-opening-right').append(image);
    const duplicate = book.querySelector('.dv-opening-left img');
    const sync = () => { duplicate.src = image.src; };
    sync();
    new MutationObserver(sync).observe(image, { attributes: true, attributeFilter: ['src'] });
    pose(stage, 0);
    let opened = false;
    const open = () => { if (!opened) { opened = true; start(stage); } };
    observe(stage, book, open);
    const viewer = stage.closest('[data-az-viewer], [data-spread-viewer]');
    viewer?.addEventListener('pointerdown', event => {
      if (!event.target.closest('.dv-flat-opening, button')) return;
      if (!opened) open();
      running.get(stage)?.();
    }, { capture: true });
    viewer?.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { if (!opened) open(); running.get(stage)?.(); }
    }, { capture: true });
  }
})();
