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

## Key files

- `index.html` — homepage and its active asset references
- `assets/` — homepage styles, interactions, fonts, and editorial imagery
- `books/` — public book detail pages and book covers
- `collections/` — public category pages
- `scripts/validate-site.mjs` — checks publish roots, local references, and
  unresolved placeholders
- `.github/workflows/pages.yml` — production deployment

## Validate

```bash
npm run validate
```

The validator requires Node.js only; there are no package dependencies.
