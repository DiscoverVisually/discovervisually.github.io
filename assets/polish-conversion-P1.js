(() => {
  const gallery = document.querySelector(".book-gallery");
  const controls = document.querySelector(".gallery-controls");
  if (!gallery || !controls) return;

  const cards = [...gallery.querySelectorAll(".book-card-shell")];
  const current = controls.querySelector("b");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const nearestCardIndex = () => {
    const galleryCenter = gallery.scrollLeft + gallery.clientWidth / 2;
    let nearest = 0;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const nextDistance = Math.abs(center - galleryCenter);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = index;
      }
    });
    return nearest;
  };

  const updateCount = () => {
    if (current) current.textContent = String(nearestCardIndex() + 1).padStart(2, "0");
  };

  const move = (direction) => {
    const next = Math.max(0, Math.min(cards.length - 1, nearestCardIndex() + direction));
    cards[next]?.scrollIntoView({
      behavior: reduced.matches ? "auto" : "smooth",
      block: "nearest",
      inline: "center"
    });
  };

  controls.querySelector(".gallery-prev")?.addEventListener("click", () => move(-1));
  controls.querySelector(".gallery-next")?.addEventListener("click", () => move(1));
  gallery.addEventListener("scroll", () => requestAnimationFrame(updateCount), { passive: true });
  addEventListener("resize", updateCount, { passive: true });
  updateCount();
})();
