# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A detailed companion guide also lives in `AGENTS.md`. This file is the canonical summary; keep both in sync when conventions change.

## What this is

**Cialo Hub** — a single-page internal information system for Clínica Cialo (protocols, technical scripts, payment policies, products, consents, budgets, professionals, treatments, boxes, FAQ). All content is static; there is **no backend and no API**. The app is read-heavy reference material for clinic reception staff, in Spanish.

## Commands

```bash
npm run dev       # Vite dev server on port 3000, auto-opens browser
npm run build     # Production build
npm run preview   # Preview the production build
```

There are **no tests, no linter, and no TypeScript** configured. "Verifying" a change means running `npm run dev` and exercising the affected section in the browser.

## Critical architectural facts

**Vanilla JS masquerading as React.** `package.json` lists `react`, `react-dom`, and `@vitejs/plugin-react`, and `vite.config.js` enables the React plugin — but **none of the app code is React/JSX**. Every component is a plain function in `js/components/*.js` that returns an HTML **template string**. Do not introduce JSX or `.jsx` files. The React deps are vestigial.

**No bundling of app code / no ES modules.** `index.html` loads every script with sequential `<script src>` tags (not `type="module"`). Everything shares one global scope: classes, the `appState` singleton, component functions, and `init*` functions are all globals. **Load order in `index.html` matters** — data files load first, then `state.js`, then components, then `js/app.js` last. A new data file must be listed before any component that reads it.

**Third-party libs come from CDNs**, not npm: Tailwind (`cdn.tailwindcss.com`), Lucide icons (`unpkg.com/lucide`), and SheetJS/XLSX for Excel export (`cdn.sheetjs.com`). They are global (`lucide`, `XLSX`).

## How rendering works

- `js/state.js` defines `AppState` and the global singleton `appState`. State is a flat object; update only via `appState.setState(...)` or the `setActiveTab` / `setSearchTerm` / etc. convenience methods. Never mutate `appState.state` directly. `subscribe(listener)` registers re-render callbacks.
- `js/app.js` defines the `App` class (instantiated on `DOMContentLoaded`). It subscribes to `appState` and, on every change, re-renders the sidebar nav (only when relevant keys changed) and the main content area by setting `innerHTML`.
- Routing is a `switch (state.activeTab)` in `App.renderContentView()`. The default tab is `'base'`, which renders `HomeContent()`. A non-empty `searchTerm` short-circuits routing and renders `SearchResults()` instead.
- **After any dynamic `innerHTML` insertion you must call `lucide.createIcons()`** or icons render as empty `<i data-lucide>` tags. `app.js` does this after each render; replicate it in any code that injects HTML later.
- Components needing event listeners expose a global `init<Section>Content()` / `init<Section>Listeners()` function that `app.js` calls after inserting the section's HTML (see the `if (state.activeTab === ...)` block at the end of `renderContentView`). Sidebar listeners are bound once in `App.init()` via `initSidebarListeners()`.

## Adding a new section (the full path)

1. Add a `case` in the `switch` in `js/app.js` `renderContentView()` (set `title`, `icon`, `content`).
2. Add the nav item in `js/components/Sidebar.js`.
3. Create `js/components/<Section>Content.js` returning an HTML string; if it needs data, add a `js/<section>Data.js`.
4. If interactive, add an `init<Section>Content()` global and call it from the `init` block at the end of `renderContentView`.
5. Register every new file as a `<script>` in `index.html` **in dependency order** (data before component, all before `js/app.js`).

## Data & content conventions

- All domain data lives in `js/*Data.js` as plain global objects/arrays (e.g. `data.js`, `productsData.js`, `profesionalesData.js`, `tratamientosData.js`). Editing clinic content = editing these files.
- Professional/treatment reference info is mirrored in `docs/PROFESIONALES_TRATAMIENTOS.md`. When you change prices or professional data, update **both** the data file and that doc.
- Excel export across sections goes through `js/utils/excelExporter.js` (uses the global `XLSX`).
- Spanish is the content and UI language; match it in user-facing strings.

## Gotchas

- **PWA is intentionally disabled.** The manifest/service-worker tags are commented out in `index.html` and `js/pwa.js` is not loaded. Do not re-enable without an explicit request.
- **Dev cache-busting is automatic:** a script at the bottom of `index.html` re-appends every local `<script src>` with a `?v=<timestamp>` query on `file:`/`localhost`. Expect scripts to reload; don't rely on script identity.
- Styling is Tailwind utility classes first; custom CSS (layout, sidebar, print styles for consents, scrollbar) is in `css/styles.css`. The `app-mode-full-height` class is toggled on `#mainContent` for the Tratamientos section only.
