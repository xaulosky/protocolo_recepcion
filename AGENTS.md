# Cialo Hub - Agent Instructions

## Project Overview

Single-page vanilla JavaScript web application for Clínica Cialo internal clinic management (protocols, scripts, payments, products, professionals, treatments, consent forms). All data is static and stored in JavaScript files.

## Architecture

- **Entry point**: `index.html` loads all scripts sequentially (no bundler for JS)
- **App orchestrator**: `js/app.js` - `App` class manages rendering and state subscriptions
- **State management**: `js/state.js` - `AppState` singleton class, global variable `appState`
- **Components**: Vanilla JS functions returning HTML template strings (NOT React components despite `package.json` dependencies)
- **Data**: Static data in `js/data.js`, `js/productsData.js`, `js/protocolsData.js`, etc.
- **Styling**: Tailwind CSS via CDN + custom styles in `css/styles.css`

## Key Files

- `index.html` - Main HTML, loads all scripts in specific order
- `js/app.js` - Main app class, routes sections via `switch(state.activeTab)`
- `js/state.js` - Global state singleton
- `js/components/*.js` - Component functions (return HTML strings)
- `css/styles.css` - Custom CSS alongside Tailwind
- `docs/PROFESIONALES_TRATAMIENTOS.md` - Professional/treatment reference documentation

## Development Commands

```bash
# Dev server (Vite, port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Alternative: Python HTTP server (port 8000)
.\servidor.bat
# or: python -m http.server 8000
```

## Important Conventions

- **No React/JSX**: Despite React dependencies, components are vanilla JS functions returning template strings. Do not use JSX.
- **Script loading order matters**: `index.html` loads data files before components before `app.js`. New data files must be added before components that use them.
- **Global state**: Use `appState.setActiveTab('tabName')` and `appState.subscribe()` for state changes. Never mutate `appState.state` directly.
- **Lucide icons**: Call `lucide.createIcons()` after any dynamic HTML insertion.
- **PWA disabled**: Service worker and manifest are commented out in `index.html`. Do not re-enable without explicit request.
- **Cache busting**: Development cache busting is automatic via script at bottom of `index.html`.

## Adding New Sections

1. Add tab case in `js/app.js` `renderContentView()` switch statement
2. Add navigation item in `js/components/Sidebar.js`
3. Create component function in `js/components/NewSection.js`
4. Add init function call in `js/app.js` if section needs JS initialization
5. Add script tag in `index.html` before `js/app.js`

## Data Management

- All clinic data lives in static JS files (no backend, no API)
- Prices, protocols, and professional info must be updated in both data files AND `docs/PROFESIONALES_TRATAMIENTOS.md`
- Use `js/data.js` for protocols/scripts, separate files for products, professionals, treatments, etc.

## Styling Notes

- Tailwind utility classes are primary styling method
- Custom CSS in `css/styles.css` for layout, sidebar, print styles, and scrollbar handling
- Print styles exist for consent forms (`@media print`)
- `app-mode-full-height` class used for full-height sections like Tratamientos
