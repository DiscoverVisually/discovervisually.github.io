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

  const updateOpening = () => {
    ticking = false;
    const rect = shell.getBoundingClientRect();
    const bookRect = book.getBoundingClientRect();
    const fullyVisibleLine = window.innerHeight * .94;
    const start = Math.max(0, bookRect.bottom - fullyVisibleLine);
    const travel = Math.max(window.innerHeight * 1.35, 760);
    let progress = Math.min(1, Math.max(0, (-rect.top - start + window.innerHeight * .1) / travel));

    if (bookRect.top >= window.innerHeight * .03 && bookRect.bottom <= fullyVisibleLine) {
      const visibleProgress = (window.innerHeight * .16 - rect.top) / travel;
      progress = Math.max(progress, Math.min(1, Math.max(0, visibleProgress)));
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) progress = progress > .04 ? 1 : 0;
    inside.style.setProperty('--pm-open-progress', progress.toFixed(4));
    inside.classList.toggle('has-visible-pages', progress >= .16);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateOpening);
  };

  document.querySelector('.pm-prev')?.addEventListener('click', () => showSpread(active - 1));
  document.querySelector('.pm-next')?.addEventListener('click', () => showSpread(active + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSpread(index)));
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  showSpread(0);
  requestUpdate();
})();
