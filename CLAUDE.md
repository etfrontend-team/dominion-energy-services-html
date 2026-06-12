# CLAUDE.md

## Commands

```bash
npm run build     # Tailwind watch → dist/style.css
npm run lint:fix  # ESLint --fix + Prettier
npx eslint .
```

## Architecture

Static HTML/CSS/JS, Tailwind v4, Netlify. CSS layers: `base.css` → `component.css` → `layout.css` → `utilities.css`. Entry: `assets/css/style.css` → `dist/style.css` (gitignored). JS: `assets/js/app.js` (module). Route: `/` → `/pages/index.html`.

## ESLint — Required Attrs

- `<a>`: `href`, `role="link"`, `aria-label`, `target`
- `<button>`: `type`, `aria-label`
- `<img>`: `alt`, `width`, `height`, `loading="lazy"`
- `<video>`: `width`, `height`, `playsinline`, `preload`
- Page needs `<main>`. No `javascript:` hrefs, no multiple `<h1>`, no skipped heading levels.

## Git Hooks

**pre-commit:** heading check → asset size (images 1 MB, videos 10 MB) → lint-staged.
**pre-push:** asset size on all tracked files.

## Tailwind v4

No `tailwind.config.js`. Config in `@theme {}`. All styles via `@apply` in layer files only.
