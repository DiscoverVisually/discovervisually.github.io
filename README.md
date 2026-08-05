# Discover Visually

Production source for the Discover Visually publishing website.

## Architecture

The site is intentionally static: HTML, CSS, JavaScript, and image assets are
published directly by GitHub Pages. There is no React, Vite, Tailwind, Vinext,
or generated application runtime.

The deployment publishes only:

- `index.html`
- `favicon.svg`
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
