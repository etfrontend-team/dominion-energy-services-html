# html-setup

Static HTML/CSS/JS boilerplate. Tailwind CSS v4. Deploys to Netlify.

> **Note:** `.claude/`, `CLAUDE.md`, and `.vscode/` are local reference files only. Do **not** push them to the repository.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Commands](#commands)
- [Architecture](#architecture)
- [HTML Rules](#html-rules)
- [CSS Rules](#css-rules)
- [JavaScript Rules](#javascript-rules)
- [Git Hooks](#git-hooks)
- [ESLint Rules](#eslint-rules)
- [Prettier Config](#prettier-config)
- [Netlify Deploy](#netlify-deploy)

---

## Project Structure

```
html-setup/
├── assets/
│   ├── css/
│   │   ├── style.css        # Entry — imports all layers + @theme config
│   │   ├── base.css         # Headings, paragraphs, containers, general-padding
│   │   ├── component.css    # Buttons, inputs, selects, reusable components
│   │   ├── layout.css       # Header and footer styles only
│   │   └── utilities.css    # Section-specific and helper classes
│   ├── images/              # Image assets (SVG, WebP, AVIF)
│   ├── videos/              # Video assets
│   └── js/
│       └── app.js           # JS entry point — imports only, DOMContentLoaded here
├── dist/
│   └── style.css            # Tailwind build output (gitignored)
├── pages/
│   └── index.html           # Main HTML page
├── .husky/
│   ├── pre-commit           # Heading check → asset size check → lint-staged
│   ├── pre-push             # Asset size check on all tracked files
│   └── scripts/
│       ├── check-headings.mjs   # Validates heading hierarchy in staged HTML
│       └── check-assets.sh      # Validates image/video file sizes
├── eslint.config.mjs
├── .prettierrc
├── netlify.toml
└── package.json
```

---

## Getting Started

```bash
npm install
npm run build
```

Open `pages/index.html` in browser or use a local server (e.g. Live Server in VS Code).

---

## Commands

| Command                  | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| `npm run build`          | Tailwind watch: `assets/css/style.css` → `dist/style.css` |
| `npx eslint .`           | Run ESLint across all JS and HTML files                   |
| `npx prettier --write .` | Format all files with Prettier                            |
| `npm run lint:fix`       | Auto-fix ESLint errors + format with Prettier             |

---

## Architecture

- **Pages:** `pages/index.html` — entry HTML file
- **CSS:** Tailwind v4 via `@apply` in CSS layer files. No `tailwind.config.js` — config lives in `@theme {}` inside `style.css`
- **JS:** ES modules. Single entry `assets/js/app.js`, one module file per feature
- **Deploy:** Netlify — root `/` redirects to `/pages/index.html`
- **Build output:** `dist/style.css` is gitignored, built by Netlify on deploy

---

## HTML Rules

| #   | Rule                                                                                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No classes on `body`, `html`, `header`, `footer` — style via CSS selectors                                                                                                                |
| 2   | No inline `style=""` — all styling in CSS files via `@apply`                                                                                                                              |
| 3   | Every `<a>` needs `href`, `role="link"`, `target`, `aria-label` — each attribute on its own line                                                                                          |
| 4   | Every `<button>` needs `type="button"\|"submit"` and `aria-label` — each on its own line                                                                                                  |
| 5   | Every `<section>` gets exactly two classes: `{section-name} general-padding`                                                                                                              |
| 6   | Every `<img>` needs `width`, `height`, `alt`, `loading="lazy"` on separate lines — `alt` must never be empty                                                                              |
| 6a  | Every `<video>` needs `width`, `height`, `preload`, `playsinline` on separate lines                                                                                                       |
| 7   | Never put classes directly on `h1`–`h6` — always wrap in a `<div class="title title-{color}">`                                                                                            |
| 8   | Never put classes directly on `<p>` — always wrap in a `<div class="content content-{color}">`                                                                                            |
| 9   | `<a>` with phone → `href="tel:{n}"`, email → `href="mailto:{e}"`                                                                                                                          |
| 10  | All `<section>` elements must live inside `<main>`                                                                                                                                        |
| 11  | Only these Tailwind classes allowed directly in HTML: `flex`, `flex-col`, `flex-row`, `grid`, `grid-cols-*`, `gap-*`, `p-*`, `m-*`, `max-w-*` — everything else via `@apply` in CSS files |
| 12  | Every `<input>` needs a `<label>` linked via matching `for` / `id`                                                                                                                        |
| 13  | Semantic HTML, correct heading hierarchy, all accessibility attributes                                                                                                                    |
| 14  | Pixel-perfect match to Figma. Clean indentation throughout                                                                                                                                |
| —   | No `javascript:` hrefs, no multiple `<h1>`, no skipped heading levels                                                                                                                     |

**Heading wrapper pattern:**

```html
<div class="title title-black">
  <h1>Heading text</h1>
</div>
```

**Paragraph wrapper pattern:**

```html
<div class="content content-black">
  <p>Paragraph text</p>
</div>
```

---

## CSS Rules

### Layer order (`style.css` imports)

```css
@import 'tailwindcss';
@import './base.css';
@import './component.css';
@import './layout.css';
@import './utilities.css';
```

### General rules

| #   | Rule                                                                                         |
| --- | -------------------------------------------------------------------------------------------- |
| 1   | All styles via `@apply` only — zero raw CSS properties anywhere                              |
| 2   | Responsive styles use `max-*` / `min-*` breakpoint prefixes only — no `@media` queries       |
| 3   | Base and responsive classes in the **same** `@apply` line — never split into separate blocks |
| 4   | No `[]` arbitrary values — no `text-[20px]`, `max-w-[452px]`, etc.                           |
| 5   | No `h-*` or `min-h-*` on any element — `h-full` is the only exception                        |
| 6   | No `w-*` or `min-w-*` on any element — `w-full` is the only exception                        |
| 7   | No `@layer` wrappers anywhere                                                                |
| 8   | No new CSS variables, no `:root` block — reuse only what is in `style.css`                   |
| 9   | Tailwind v4 classes only                                                                     |

```css
/* correct — base + responsive in one @apply */
.hero-title {
  @apply text-heading-1 max-768:text-22;
}

/* wrong — split @apply */
.hero-title {
  @apply text-heading-1;
}
.hero-title {
  @apply max-768:text-22;
}

/* wrong — arbitrary value */
.hero-title {
  @apply text-[48px];
}
```

### `style.css` — `@theme {}` block

Contains breakpoints, spacing, and design tokens. Nothing else.

**Breakpoints:**

```css
--breakpoint-1920: 1921px;
--breakpoint-1600: 1601px;
--breakpoint-1512: 1513px;
--breakpoint-1440: 1441px;
--breakpoint-1366: 1367px;
--breakpoint-1199: 1200px;
--breakpoint-1024: 1025px;
--breakpoint-992: 993px;
--breakpoint-768: 769px;
--breakpoint-640: 641px;
--breakpoint-576: 577px;
--breakpoint-425: 426px;
--breakpoint-375: 376px;
```

**Spacing:** `--spacing: 1px;`

**Design tokens (fetch from Figma — never hardcode):**

```css
--font-{name}: "{Family}", sans-serif;
--color-{name}: {hex};
--text-heading-1: {px};   /* largest — always generate all 6 */
--text-heading-2: {px};
--text-heading-3: {px};
--text-heading-4: {px};
--text-heading-5: {px};
--text-heading-6: {px};
--text-{size}: {px};      /* remaining sizes e.g. --text-14: 14px */
```

### `base.css`

```css
/* Headings — tag + class, responsive in same @apply */
h1, .h1 { @apply text-heading-1 max-768:text-22 }
h2, .h2 { @apply text-heading-2 max-768:text-20 }
h3, .h3 { @apply text-heading-3 max-768:text-18 }
h4, .h4 { @apply text-heading-4 max-768:text-16 }
h5, .h5 { @apply text-heading-5 max-768:text-14 }
h6, .h6 { @apply text-heading-6 max-768:text-12 }

/* Paragraphs */
.content p { @apply text-16 }
.content p + p { @apply mt-10 }

/* Title colors — one per color from Figma */
.title-{color} h1,
.title-{color} h2,
.title-{color} h3,
.title-{color} h4,
.title-{color} h5,
.title-{color} h6 { @apply text-{color} }

/* Content colors — one per color from Figma */
.content-{color} p { @apply text-{color} }

/* Containers — X-axis padding from Figma, no max-width */
.container-fluid    { @apply px-50 }
.container-fluid-md { @apply px-80 }

/* General padding — Y-axis from Figma, on every section */
.general-padding { @apply py-100 max-1199:py-50 max-768:py-30 }
```

### `component.css`

```css
/* Button base + variants — all need hover + transition */
.btn { @apply px-16 py-8 inline-flex items-center text-center rounded-10 border-1 border-solid cursor-pointer transition-all duration-300 }
.btn-{color} { @apply text-{x} bg-{x} border-{x} hover:bg-{y} hover:text-{y} }
```

Inputs, textarea, and select match Figma exactly — all via `@apply`.

### `layout.css`

Header and footer styles only. All via `@apply`.

### `utilities.css`

Section-specific and helper classes only. All via `@apply`.

---

## JavaScript Rules

| #   | Rule                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | Single entry point: `assets/js/app.js` — contains imports only                                                        |
| 2   | One module file per feature: `header.js`, `swiper.js`, etc.                                                           |
| 3   | Default export with `init` prefix in every module                                                                     |
| 4   | `DOMContentLoaded` in `app.js` only — never in other files                                                            |
| 5   | File names in `camelCase`                                                                                             |
| 6   | `let` / `const` only — no `var`                                                                                       |
| 7   | Wrap all logic in `if` guards — never execute without checking element exists                                         |
| 8   | No unnecessary or repeated function calls                                                                             |
| 9   | `getElementById` for unique elements, `querySelector` / `querySelectorAll` for repeated — no `getElementsByClassName` |
| 10  | All Swiper code in `swiper.js`, imported into `app.js`                                                                |
| 11  | GSAP for complex animations — include ScrollTrigger when scroll-based                                                 |

```js
// header.js
export default function initHeader() {
  // logic here
}

// app.js
import initHeader from './header'
import initSwiper from './swiper'

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header')
  if (header) initHeader()

  const slider = document.querySelector('.swiper')
  if (slider) initSwiper()
})
```

---

## Git Hooks

Managed by Husky. Scripts live in `.husky/scripts/`.

### pre-commit

Runs in order:

1. **Heading hierarchy check** (`check-headings.mjs`) — validates staged HTML files have no skipped heading levels and start with `h1`
2. **Asset size check** (`check-assets.sh`) — validates staged files meet size limits
3. **lint-staged** — runs ESLint + Prettier on staged files

### pre-push

Runs **asset size check** on all tracked files.

### Asset size limits

| Asset type                | Limit | Allowed formats                                         |
| ------------------------- | ----- | ------------------------------------------------------- |
| Images (`assets/images/`) | 1 MB  | All formats including `.jpg`, `.jpeg`, `.png`           |
| Videos (`assets/videos/`) | 10 MB | `.mp4`, `.webm`, `.mov`, `.avi`, `.mkv`, `.flv`, `.ogv` |

---

## ESLint Rules

### JavaScript

| Rule                   | Level |
| ---------------------- | ----- |
| `no-console`           | error |
| `no-debugger`          | error |
| `no-alert`             | error |
| `no-use-before-define` | error |
| `no-duplicate-imports` | error |
| `no-var`               | error |

### HTML

| Rule                 | Description                          |
| -------------------- | ------------------------------------ |
| `require-main`       | Page must contain a `<main>` element |
| `no-javascript-href` | `href="javascript:..."` not allowed  |
| `no-duplicate-id`    | No duplicate `id` attributes         |
| `no-multiple-h1`     | Only one `<h1>` per page             |
| `require-img-alt`    | `<img>` must have `alt`              |
| `require-attrs`      | See required attributes table below  |

**Required attributes:**

| Tag        | Required attributes                           |
| ---------- | --------------------------------------------- |
| `<a>`      | `href`, `role="link"`, `aria-label`, `target` |
| `<button>` | `type`, `aria-label`                          |
| `<img>`    | `width`, `height`, `loading="lazy"`           |
| `<video>`  | `width`, `height`, `playsinline`, `preload`   |

---

## Prettier Config

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "singleQuote": true,
  "semi": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "jsxSingleQuote": true,
  "singleAttributePerLine": true,
  "bracketSameLine": true,
  "printWidth": 200
}
```

---

## Netlify Deploy

```toml
[build]
  command = "npx tailwindcss -i ./assets/css/style.css -o ./dist/style.css"
  publish = "."

[[redirects]]
  from = "/"
  to = "/pages/index.html"
  status = 200
```

`dist/style.css` is gitignored — Netlify builds it on every deploy.

---

## Local Reference Files (Do Not Push)

| Path        | Purpose                                                              |
| ----------- | -------------------------------------------------------------------- |
| `.claude/`  | Claude Code agents, skills, and commands for AI-assisted development |
| `CLAUDE.md` | Claude Code project instructions and architecture reference          |
| `.vscode/`  | Editor settings for VS Code                                          |

These files are local tooling aids. They must not be committed or pushed to the repository.
