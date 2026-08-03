(() => {
  const hero = document.querySelector('.pm-hero');
  const heroBook = document.querySelector('.pm-hero-book');
  const inside = document.querySelector('.pm-inside');
  const shell = document.querySelector('.pm-open-book-shell');

  if (hero && heroBook) {
    const setHover = (active) => hero.classList.toggle('is-book-hovered', active);
    heroBook.addEventListener('pointerenter', () => setHover(true));
    heroBook.addEventListener('pointerleave', () => setHover(false));
    heroBook.addEventListener('focusin', () => setHover(true));
    heroBook.addEventListener('focusout', () => setHover(false));
  }

  if (!inside || !shell) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;

  const updateOpening = () => {
    ticking = false;
    const rect = shell.getBoundingClientRect();
    const start = window.innerHeight * 0.92;
    const distance = Math.max(window.innerHeight * 1.08, shell.offsetHeight * 0.98);
    let progress = Math.min(1, Math.max(0, (start - rect.top) / distance));
    if (reduceMotion.matches) progress = progress > 0.08 ? 1 : 0;
    inside.style.setProperty('--pm-open-progress', progress.toFixed(4));
    inside.classList.toggle('is-scroll-opening', progress > 0 && progress < 1);
  };

  const requestOpeningUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateOpening);
  };

  window.addEventListener('scroll', requestOpeningUpdate, { passive: true });
  window.addEventListener('resize', requestOpeningUpdate);
  reduceMotion.addEventListener?.('change', requestOpeningUpdate);
  requestOpeningUpdate();
})();
