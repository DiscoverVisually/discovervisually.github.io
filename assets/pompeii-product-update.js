(() => {
  const hero = document.querySelector('.pm-hero');
  const heroBook = document.querySelector('.pm-hero-book');
  const stage = document.querySelector('.pm-hero-stage');

  if (stage) {
    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
      stage.style.setProperty('--pm-x', x.toFixed(3));
      stage.style.setProperty('--pm-y', y.toFixed(3));
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--pm-x', '0');
      stage.style.setProperty('--pm-y', '0');
    });
  }

  if (hero && heroBook) {
    const setHover = (active) => hero.classList.toggle('is-book-hovered', active);
    heroBook.addEventListener('pointerenter', () => setHover(true));
    heroBook.addEventListener('pointerleave', () => setHover(false));
    heroBook.addEventListener('focusin', () => setHover(true));
    heroBook.addEventListener('focusout', () => setHover(false));
  }

  const inside = document.querySelector('.pm-inside');
  const shell = document.querySelector('.pm-open-book-shell');
  const book = document.querySelector('.pm-open-book');
  const artImage = document.querySelector('.pm-spread-art img');
  if (!inside || !shell || !book || !artImage) return;

  const spreads = [
    {
      src: '../assets/pompeii-interior-street.webp',
      alt: 'A Day in Pompeii — an immersive street-level view of the living Roman city',
      description: 'Experience ancient Pompeii through the first-person view of a time traveller.'
    },
    {
      src: '../assets/pompeii-interior-home.webp',
      alt: 'Inside a Roman Home — an illustrated cutaway infographic',
      description: 'Explore an infographic cutaway of a Roman home—from its rain-catching atrium to the rooms where a family lived.'
    },
    {
      src: '../assets/pompeii-interior-food.webp',
      alt: 'Ancient Fast Food — daily life at a Pompeii thermopolium',
      description: 'Discover how people really lived in the city, from everyday food and busy counters to the rhythm of a Pompeian street.'
    },
    {
      src: '../assets/pompeii-interior-eruption.webp',
      alt: 'The eruption of Mount Vesuvius visualized above Pompeii',
      description: 'Witness Vesuvius erupt through cinematic visualizations grounded in real eyewitness accounts and volcanic science.'
    },
    {
      src: '../assets/pompeii-interior-archaeology.webp',
      alt: 'The rediscovery and archaeology of the buried city of Pompeii',
      description: 'Follow the aftermath—from the buried city to archaeology, rediscovery and everything Pompeii still teaches us today.'
    }
  ];

  const counter = document.querySelector('.pm-spread-controls > span');
  const description = document.querySelector('.pm-spread-controls > p');
  const dots = Array.from(document.querySelectorAll('.pm-spread-controls button'));
  let active = 0;
  let ticking = false;
  let openProgress = 0;
  let touchY = null;

  const showSpread = (index) => {
    active = (index + spreads.length) % spreads.length;
    const spread = spreads[active];
    book.classList.remove('pm-flipping');
    void book.offsetWidth;
    book.classList.add('pm-flipping');
    artImage.src = spread.src;
    artImage.alt = spread.alt;
    if (counter) counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(spreads.length).padStart(2, '0')}`;
    if (description) description.textContent = spread.description;
    dots.forEach((dot, i) => i === active ? dot.setAttribute('aria-current', 'true') : dot.removeAttribute('aria-current'));
  };

  const isDesktop = () => window.matchMedia('(min-width: 721px)').matches;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setProgress = (value) => {
    openProgress = Math.min(1, Math.max(0, value));
    if (reducedMotion() && openProgress > .01) openProgress = 1;
    inside.style.setProperty('--pm-open-progress', openProgress.toFixed(4));
    inside.classList.toggle('has-visible-pages', openProgress > .015);
    const rect = inside.getBoundingClientRect();
    const pinned = Math.abs(rect.top) <= 3 && Math.abs(rect.bottom - window.innerHeight) <= 3;
    inside.classList.toggle('is-scroll-locked', isDesktop() && pinned && openProgress < 1);
  };

  const pinSection = () => {
    const rect = inside.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top, behavior: 'auto' });
  };

  const consumeOpeningScroll = (delta) => {
    if (!isDesktop() || Math.abs(delta) < .5) return false;
    const rect = inside.getBoundingClientRect();
    const enteringFromAbove = delta > 0 && rect.top > 0 && rect.top <= Math.abs(delta) + 8;
    const enteringFromBelow = delta < 0 && rect.top < 0 && -rect.top <= Math.abs(delta) + 8 && openProgress > 0;

    if (enteringFromAbove || enteringFromBelow) pinSection();

    const aligned = enteringFromAbove || enteringFromBelow || Math.abs(rect.top) <= 3;
    if (!aligned) return false;
    if ((delta > 0 && openProgress >= 1) || (delta < 0 && openProgress <= 0)) return false;

    setProgress(openProgress + delta / Math.max(1100, window.innerHeight * 1.35));
    return true;
  };

  const updateOpening = () => {
    ticking = false;
    if (isDesktop()) {
      setProgress(openProgress);
      return;
    }

    const rect = shell.getBoundingClientRect();
    const start = window.innerHeight * .82;
    const travel = Math.max(window.innerHeight * .75, 520);
    setProgress((start - rect.top) / travel);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateOpening);
  };

  document.querySelector('.pm-prev')?.addEventListener('click', () => showSpread(active - 1));
  document.querySelector('.pm-next')?.addEventListener('click', () => showSpread(active + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSpread(index)));
  window.addEventListener('wheel', (event) => {
    if (consumeOpeningScroll(event.deltaY)) event.preventDefault();
  }, { passive: false });
  window.addEventListener('touchstart', (event) => {
    touchY = event.touches[0]?.clientY ?? null;
  }, { passive: true });
  window.addEventListener('touchmove', (event) => {
    const nextY = event.touches[0]?.clientY;
    if (touchY === null || nextY === undefined) return;
    const delta = touchY - nextY;
    touchY = nextY;
    if (consumeOpeningScroll(delta * 1.5)) event.preventDefault();
  }, { passive: false });
  window.addEventListener('keydown', (event) => {
    const amount = event.key === 'ArrowDown' ? 80 : event.key === 'ArrowUp' ? -80 : event.key === 'PageDown' || event.key === ' ' ? 260 : event.key === 'PageUp' ? -260 : 0;
    if (amount && consumeOpeningScroll(amount)) event.preventDefault();
  });
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  showSpread(0);
  requestUpdate();
})();
