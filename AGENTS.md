# AGENTS.md — DiscoverVisually Web Project

## Project purpose

This repository contains the public website for **DiscoverVisually**, a modern creative publishing house focused on visually rich books, giftable titles, children’s stories, creative learning books, spiritual visual guides, romantasy-inspired titles, and non-English books.

The website should feel like a **premium publishing house storefront**, not a generic template.

Primary goal:
- Guide visitors quickly into the right book category.
- Make the page feel polished, trustworthy, cinematic, and conversion-focused.
- Use real book-cover and hero assets from the repository.
- Build clean, maintainable frontend code that works well on desktop, tablet, and mobile.

---

## Important environment constraint

This project is edited through **cloud Codex connected to GitHub**.

Do **not** assume that new libraries can be installed.

### Dependency rules

- Prefer using the existing project setup and existing dependencies.
- Do not add new npm packages unless the user explicitly asks for it.
- Do not require the user to run local installation steps.
- If a desired feature needs a missing dependency, implement it with existing tools instead.
- Use plain React, TypeScript, CSS, CSS modules, Tailwind, or existing styling setup depending on what is already present in the repo.
- Before choosing an implementation pattern, inspect `package.json`, `src`, and the current project structure.

If the repo already contains libraries such as Tailwind, shadcn/ui, lucide-react, or framer-motion, they may be used. If they are not already installed, do not add them.

---

## Working style for Codex

Before making changes, read:

- `AGENTS.md`
- `README.md` if present
- files in `docs/` if present
- `package.json`
- existing source structure
- asset folders under `public/`

When working on UI tasks:

1. Inspect available assets first.
2. Identify image paths and existing design tokens.
3. Build the UI using real assets, not fake recreated cover art.
4. Keep changes scoped and understandable.
5. Run the available project checks before finishing.

Recommended checks:

```bash
npm run build
```

If lint scripts exist:

```bash
npm run lint
```

If a check fails, fix the issue before completing the task.

---

## Design quality bar

The website should look like a **premium cinematic bookshop / publishing house landing page**.

Target feeling:

- dark cinematic
- warm gold lighting
- elegant editorial typography
- premium bookshop atmosphere
- carefully curated
- giftable
- story-rich
- trustworthy
- visually immersive but still clean and readable

Avoid:

- generic SaaS landing page look
- bright blue/purple startup gradients
- Bootstrap-style cards
- cluttered layouts
- fake lorem ipsum
- fake book-cover text recreated in HTML
- overcomplicated animations
- inconsistent spacing
- too many competing CTAs
- mobile layouts that feel like an afterthought

---

## Brand

Brand name:

```txt
DiscoverVisually
```

Logo treatment:

- Keep “Discover” and “Visually” together as one wordmark.
- “Visually” can use a green accent if the current design supports it.
- Do not change the brand name spelling.
- Do not localize the brand name.

Preferred positioning:

```txt
Modern Creative Publishing House
```

---

## Language rules

The website should be **English only** unless the user explicitly requests localized variants.

Do not use Slovak UI copy on the main English homepage.

Do not use Slovak and Polish as separate categories. Combine them into:

```txt
Non-English Books
```

---

## Core homepage categories

Use exactly these main categories unless the user asks otherwise:

1. Spiritual
2. Romantasy
3. For Children
4. Arts, Crafts & Educational
5. Non-English Books

Priority categories:

- Spiritual
- Romantasy

These should receive stronger CTA emphasis and larger visual treatment.

Secondary categories:

- For Children
- Arts, Crafts & Educational
- Non-English Books

---

## Homepage structure

The homepage should follow this structure unless the user gives a new direction.

### 1. Header / navigation

Required elements:

- DiscoverVisually logo
- Navigation links:
  - Home
  - Spiritual
  - Romantasy
  - For Children
  - Arts, Crafts & Educational
  - Non-English Books
- Optional utility icons if already supported:
  - Search
  - Wishlist
  - Cart
- Primary header CTA:
  - Join the Club
  - or Explore Catalog

Header style:

- dark
- premium
- subtle border or glow
- sticky or fixed only if it does not harm mobile usability
- readable at all viewport widths

### 2. Hero section

Purpose:
- Immediately communicate the publishing-house feel.
- Show the core book-world aesthetic.
- Push visitors into Spiritual or Romantasy first.

Suggested copy:

```txt
Eyebrow:
INSPIRATION. STORIES. DISCOVERY.

Headline:
Every category opens a different world.

Body:
Explore handpicked visual books, story-rich guides, and creative titles made to inspire, teach, and delight.

Primary CTA:
Shop Spiritual

Secondary CTA:
Explore Romantasy
```

Hero visual:

- Use the real hero bookshelf image from `public/images` if available.
- If there is an asset named similar to `hero-bookshelf`, use it as the main hero image.
- Do not recreate the book covers with CSS.
- Do not crop important parts of book covers unless necessary for responsive layout.
- Preserve the cinematic mood of the image.

Trust points under hero:

- Carefully curated
- Perfect gifts
- Secure shopping

### 3. Category section

Heading:

```txt
Shop by category
```

Layout requirement:

- Exactly 2 large feature cards:
  - Spiritual
  - Romantasy
- Exactly 3 compact cards:
  - For Children
  - Arts, Crafts & Educational
  - Non-English Books

Large cards should feel premium and visual.
Compact cards should still be polished, readable, and clickable.

Each card should include:

- category name
- short description
- clear CTA such as “Explore”
- relevant image or background treatment
- subtle hover state

Suggested descriptions:

```txt
Spiritual
Visual guides to faith, reflection, and deeper meaning.

Romantasy
Magical worlds, intense emotions, and story-rich escapes.

For Children
Fun stories, real facts, and big imagination.

Arts, Crafts & Educational
Creative learning books for curious minds.

Non-English Books
Selected stories and knowledge titles beyond English.
```

### 4. Trust / value strip

Include 3–4 compact benefits.

Suggested items:

```txt
Join the Club
Exclusive updates, early previews, and selected offers.

Giftable titles
Beautiful books for readers of every age.

Carefully curated
Every title is selected with purpose.

Secure shopping
Simple checkout and reader-friendly experience.
```

---

## Visual style guide

### Colors

Use the existing CSS design system if present. If not present, use a palette close to this:

```css
--background: #05070d;
--background-soft: #080d16;
--surface: #0c111c;
--surface-soft: rgba(14, 18, 28, 0.82);
--border-soft: rgba(255, 255, 255, 0.10);
--border-gold: rgba(216, 168, 74, 0.35);
--gold: #d8a84a;
--gold-light: #f3d08a;
--text-main: #f8f3ea;
--text-muted: #b9b2a6;
--brand-green: #7cf46d;
```

Use gold as the main CTA/accent color.
Use brand green sparingly for the DiscoverVisually wordmark or very small highlights.

### Typography

Preferred direction:

- large editorial serif headlines
- clean sans-serif body and UI text

If the project already has fonts configured, use them.
If no fonts are configured and new packages cannot be added, use CSS font stacks.

Suggested fallback stacks:

```css
font-family: Georgia, "Times New Roman", serif;
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Spacing

Use a consistent spacing rhythm:

```txt
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96
```

Avoid random margins and one-off spacing values.

Desktop layout should feel spacious but not empty.
Mobile layout should preserve hierarchy and CTA clarity.

### Cards

Cards should use:

- dark translucent panels
- subtle borders
- warm highlights
- rounded corners
- readable text
- large clickable areas
- soft hover states

Avoid overly bright borders or heavy shadows.

### Buttons

Primary button:

- warm gold
- high contrast
- clear label
- arrow icon if available

Secondary button:

- dark transparent surface
- subtle gold border
- readable text

Buttons should look premium and be easy to tap on mobile.

---

## Asset rules

Always inspect the actual asset paths before coding.

Common expected folders:

```txt
public/images/
public/images/covers/
public/references/
```

Use real assets from `public/images`.

Do not:

- recreate book covers using HTML/CSS text
- invent cover art
- use remote placeholder image URLs
- rely on external image services
- hardcode broken paths
- stretch covers unnaturally

For book covers:

- use `object-fit: contain` when preserving the full cover matters
- use `object-fit: cover` only for background-like crops where text is not important

For hero images:

- use responsive sizing
- allow the image to blend into the dark background with gradients or masks if helpful
- avoid cutting off the main books on desktop

---

## Responsiveness

Required breakpoints:

### Desktop

- Full hero with text left and visual right.
- Category layout with 2 large cards and 3 compact cards.
- Header navigation visible if space allows.

### Tablet

- Hero may remain two-column if readable.
- Category cards can reflow into two columns.
- Header spacing should not feel cramped.

### Mobile

- Stack hero text above image or image above text, whichever reads best.
- CTAs should be full-width or easily tappable.
- Category cards should become one column.
- Header nav should collapse or simplify if the existing project supports it.
- No horizontal overflow.

Mobile must not be treated as optional.

---

## Accessibility

Minimum requirements:

- Use semantic HTML where practical.
- Buttons and links must have accessible text.
- Images should have useful `alt` text unless decorative.
- Text contrast must remain readable.
- Do not put important text only inside background images.
- Ensure keyboard focus states are not removed.

---

## Animation rules

Animations are optional.

If implemented:

- keep them subtle
- use short durations
- avoid distracting motion
- do not animate large sections in a way that harms usability
- respect clean premium feel

Good examples:

- button hover shift
- soft card glow on hover
- gentle image scale on hover
- slight fade-up entrance if existing tooling supports it

Avoid:

- bouncing
- spinning
- excessive parallax
- heavy scroll effects
- animation that causes layout shift

---

## Code quality

Prefer:

- small reusable components
- clear data arrays for categories
- readable CSS class names
- maintainable layout structure
- minimal duplication
- simple state only when needed

Suggested component structure:

```txt
src/
  components/
    Header.tsx
    Hero.tsx
    CategoryCard.tsx
    CategorySection.tsx
    TrustStrip.tsx
  data/
    categories.ts
  styles/
    ...
```

Adapt to the existing repository structure instead of forcing this exact structure if the project already has a clean pattern.

---

## Rebuild instructions

If the user asks to rebuild the site from scratch:

- Preserve image assets.
- Preserve documentation files.
- Preserve useful config files if they work.
- Remove old UI code only when necessary.
- Rebuild the frontend cleanly using the current project stack.
- Do not delete `.git`, GitHub workflows, deployment config, or public assets.

Keep:

```txt
public/images/
public/references/
docs/
AGENTS.md
README.md
package.json
vite/config files if already working
deployment config
```

Rebuild as needed:

```txt
src/
components/
styles/
old UI pages
old unused CSS
```

---

## Git and completion behavior

When finishing a task:

- Summarize what changed.
- Mention which checks were run.
- Mention if any checks could not be run.
- Do not claim visual perfection unless actually verified.
- If assets were missing, state what fallback was used.
- If dependencies were missing, do not add them without user approval.

---

## Acceptance criteria for homepage tasks

A homepage task is complete only when:

- English-only copy is used.
- The five required categories are present.
- Spiritual and Romantasy receive priority treatment.
- Slovak and Polish are not separate categories.
- Non-English Books exists as one combined category.
- Real image assets are used.
- No broken image paths are introduced.
- The page is responsive.
- The page has a strong CTA above the fold.
- The design feels dark, cinematic, premium, and book-focused.
- `npm run build` passes, unless the repo has no build script.
