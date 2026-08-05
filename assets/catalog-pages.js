(function () {
  const books = window.DV_BOOKS || [];
  const collections = window.DV_COLLECTIONS || {};

  const cover = (book, className = "dv-catalog-cover") => book.cover
    ? `<img class="${className}" src="${book.cover}" alt="${book.title} book cover" loading="lazy">`
    : `<span class="${className} dv-catalog-cover-fallback"><small>An illustrated sacred infographic</small><strong>The<br><em>Visual</em><br>Bible</strong></span>`;

  const card = (book) => `
    <article class="dv-catalog-card" data-status="${book.status.toLowerCase().replaceAll(" ", "-")}">
      <a class="dv-catalog-image" href="${book.url}">${cover(book)}<span>Explore the book <b>↗</b></span></a>
      <div class="dv-catalog-copy">
        <p>${book.audience} · ${book.status}</p>
        <h2><a href="${book.url}">${book.title}</a></h2>
        <span>${book.description}</span>
        <div class="dv-catalog-tags">${book.collections.map(id => `<a href="${collections[id].url}">${collections[id].name}</a>`).join("")}</div>
      </div>
    </article>`;

  document.querySelectorAll("[data-catalog-grid]").forEach((grid) => {
    const collection = grid.dataset.catalogGrid;
    const shown = collection === "all" ? books : books.filter(book => book.collections.includes(collection));
    grid.innerHTML = shown.map(card).join("");
    const count = document.querySelector("[data-catalog-count]");
    if (count) count.textContent = `${shown.length} ${shown.length === 1 ? "title" : "titles"}`;
  });

  document.querySelectorAll("[data-related-books]").forEach((section) => {
    const current = section.dataset.relatedBooks;
    const book = books.find(item => item.id === current);
    if (!book) return;
    const related = books
      .filter(item => item.id !== current)
      .map(item => ({ item, score: item.collections.filter(id => book.collections.includes(id)).length }))
      .sort((a,b) => b.score - a.score)
      .slice(0,3)
      .map(match => match.item);
    const collection = collections[book.primaryCollection];
    section.innerHTML = `
      <div class="dv-related-head"><div><p class="dv-related-kicker">Continue exploring</p><h2>More for curious readers</h2></div><a class="dv-related-all" href="${collection.url}">Explore all ${collection.name.toLowerCase()} books →</a></div>
      <div class="dv-related-grid">${related.map(item => `<a class="dv-related-card" href="${item.url}">${item.cover ? `<img src="${item.cover}" alt="${item.title} book cover" loading="lazy">` : `<span class="dv-related-cover-fallback">The<br>Visual<br>Bible</span>`}<span><small>${item.audience} · ${item.status}</small><strong>${item.title}</strong><span>${item.format}</span></span></a>`).join("")}</div>`;
  });
})();
