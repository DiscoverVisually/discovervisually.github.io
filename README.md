# Discover Visually

Production source for the Discover Visually publishing website.

## Architecture

The site is intentionally static: HTML, CSS, JavaScript, and image assets are
published directly by GitHub Pages. There is no React, Vite, Tailwind, Vinext,
or generated application runtime.

The deployment publishes only:

- `index.html`
- `favicon.svg`
- `robots.txt` and `sitemap.xml`
- `assets/`
- `books/`
- `collections/`
- `about/` and `privacy/`
- `404.html`

## Key files

- `index.html` — homepage and its active asset references
- `assets/homepage.css` — the single active homepage style bundle
- `assets/homepage.js` — the single active homepage interaction bundle
- `assets/christian-collection-E1.css` / `.js` — isolated Christian category layer
- `assets/` — shared editorial imagery
- `books/` — public book detail pages and book covers
- `collections/` — public category pages
- `assets/catalog-data.js` — shared book, collection, status and audience data
- `assets/site-shell.css` / `.js` — shared publishing-house navigation and footer
- `scripts/validate-site.mjs` — checks publish roots, local references, and
  unresolved placeholders
- `.github/workflows/pages.yml` — production deployment

## Validate

```bash
npm run validate
```

The validator requires Node.js only; there are no package dependencies.

## Local preview

```bash
npm run dev
```

The preview server also requires Node.js only and serves the static site on
port 4173 by default.

## Mobile commerce

The active seven book pages use factual content evidence and real interior illustrations.
Do not publish star ratings, reader quotes, review totals or bestseller claims without a verifiable source.
`assets/book-commerce.js` owns the mobile purchase bar and shelf sample enlargement.
The bar follows the actual Amazon CTA visibility, respects safe areas, and hides for dialogs,
mobile menus, keyboards and the visible final purchase CTA.

After changing a shared book style, run `npm run build:book-styles` to regenerate
`assets/book-detail.css`. This bundles the active template styles in their original order.
Run `npm run check:commerce` and `npm run validate` before deployment.
Original spreads stay available for full-size viewing; the responsive variants are listed
in `assets/mobile-images.json`.

`assets/commerce-metrics.js` records anonymous counters within the current browser session:
`book_view`, `book_select`, `sample_open`, `sample_browse`, and `amazon_click`, with book and
placement. It creates no cookies, visitor identifiers or network requests. Inspect counters
with `DVCommerceMetrics.snapshot()` in a normal developer console, or subscribe via
`DVCommerceMetrics.subscribe(handler)`. Central reporting requires an explicitly configured
analytics collector; no collector or sales attribution is configured by this change.
