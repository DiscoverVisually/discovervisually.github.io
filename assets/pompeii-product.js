(() => {
  const stage = document.querySelector('.pm-hero-stage');
  const inside = document.querySelector('.pm-inside');
  const book = document.querySelector('.pm-open-book');

  if (stage) {
    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      stage.style.setProperty('--pm-x', x.toFixed(3));
      stage.style.setProperty('--pm-y', y.toFixed(3));
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--pm-x', '0');
      stage.style.setProperty('--pm-y', '0');
    });
  }

  if (inside) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        inside.classList.add('is-open');
        observer.disconnect();
      }
    }, { threshold: 0.28 });
    observer.observe(inside);
  }

  const spreads = [
    {
      className: 'pm-spread-city',
      label: 'The city is alive',
      title: 'Morning in Pompeii',
      tag: 'VISUAL HISTORY ADVENTURE',
      description: 'Walk through a Roman city before anyone knows it will become history.'
    },
    {
      className: 'pm-spread-forum',
      label: 'The heart of public life',
      title: 'The Forum',
      tag: 'CITY LIFE · POWER · TRADE',
      description: 'Stand in Pompeii’s busy civic center among temples, traders and public buildings.'
    },
    {
      className: 'pm-spread-home',
      label: 'Behind painted walls',
      title: 'Inside a Roman home',
      tag: 'DAILY LIFE · DESIGN · DISCOVERY',
      description: 'Explore rooms, gardens and objects that reveal how Pompeians really lived.'
    },
    {
      className: 'pm-spread-warning',
      label: 'The clues begin',
      title: 'The mountain wakes',
      tag: 'EARTHQUAKES · SCIENCE · SUSPENSE',
      description: 'Notice the warning signs and understand the forces building beneath Vesuvius.'
    },
    {
      className: 'pm-spread-eruption',
      label: 'The final hours',
      title: 'Escape through darkness',
      tag: 'ASH · PUMICE · SURVIVAL',
      description: 'Follow the choices people faced as daylight disappeared beneath ash and stone.'
    }
  ];

  const art = document.querySelector('.pm-spread-art');
  const label = document.querySelector('.pm-spread-left > span');
  const title = document.querySelector('.pm-spread-left > h3');
  const tag = document.querySelector('.pm-spread-left > p');
  const counter = document.querySelector('.pm-spread-controls > span');
  const description = document.querySelector('.pm-spread-controls > p');
  const dots = Array.from(document.querySelectorAll('.pm-spread-controls button'));
  const variantClasses = spreads.map((spread) => spread.className);
  let active = 0;

  function showSpread(index) {
    if (!art || !book) return;
    active = (index + spreads.length) % spreads.length;
    const spread = spreads[active];
    book.classList.remove('pm-flipping');
    void book.offsetWidth;
    book.classList.add('pm-flipping');
    art.classList.remove(...variantClasses);
    art.classList.add(spread.className);
    if (label) label.textContent = spread.label;
    if (title) title.textContent = spread.title;
    if (tag) tag.textContent = spread.tag;
    if (counter) counter.textContent = `${String(active + 1).padStart(2, '0')} / 05`;
    if (description) description.textContent = spread.description;
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  document.querySelector('.pm-prev')?.addEventListener('click', () => showSpread(active - 1));
  document.querySelector('.pm-next')?.addEventListener('click', () => showSpread(active + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSpread(index)));
})();
