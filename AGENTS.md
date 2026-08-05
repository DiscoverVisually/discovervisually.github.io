# Discover Visually website

This repository is the production source for the public Discover Visually
GitHub Pages site.

## Source of truth

- The site is static HTML, CSS, and JavaScript.
- Do not reintroduce React, Vite, Tailwind, Vinext, generated RSC payloads, or a
  second parallel homepage.
- `index.html`, `404.html`, `assets/`, `books/`, `collections/`, `about/`, and
  `privacy/` are the public site surfaces.
- `.github/workflows/pages.yml` defines exactly what reaches production.

## Working rules

1. Read `README.md`, the deployment workflow, and the page being changed.
2. Reuse existing book covers and editorial assets.
3. Keep new behavior in the active static implementation.
4. Do not add placeholder URLs, fake ASINs, preview-only metadata, or references
   outside the published roots.
5. Preserve mobile, keyboard, and reduced-motion behavior.
6. Run `npm run validate` and `git diff --check` before publishing.
7. Keep the homepage on exactly one CSS and one JavaScript entrypoint; do not
   add historical patch layers back into `index.html`.

## Design direction

Maintain the premium cinematic publishing-house style: dark ink, warm gold,
editorial typography, real book imagery, restrained motion, and clear routes
to a book. Avoid generic ecommerce or SaaS patterns.
