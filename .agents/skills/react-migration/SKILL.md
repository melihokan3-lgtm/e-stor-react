---
name: react-migration
description: Migrate the existing e-stor vanilla HTML/CSS/JS e-commerce project to React without losing functionality, URLs, styling, or data flow.
---

# React Migration Skill

You are migrating the existing e-stor project from vanilla HTML/CSS/JS to React.

## Mandatory rules
- First inspect the entire project before changing files.
- Do not delete the existing implementation until the React version is verified.
- Preserve existing visual design and CSS unless the user explicitly asks for a redesign.
- Preserve all existing functionality:
  - Home page
  - category/product listing
  - search
  - product detail pages
  - product URL format: /:categorySlug/:productSlug
  - image gallery
  - add-to-cart
  - localStorage cart
  - cart count
  - recommendations
  - Swiper sections
  - filters
  - previous-search UI
- Keep API behavior compatible with the current EscuelaJS API unless the user asks to change APIs.
- Preserve asset paths and verify every imported image/icon.
- Use React functional components and hooks.
- Prefer a clean Vite + React structure.
- Use React Router for routing.
- Do not use document.querySelector/insertAdjacentHTML for React-rendered UI.
- Do not build large HTML strings in JavaScript.
- Use component props and state instead of manually mutating the DOM.

## Migration order
1. Inspect all HTML, JS, CSS, JSON and asset files.
2. Create the React application structure.
3. Create global styles and asset strategy.
4. Create routing.
5. Create reusable layout components.
6. Migrate home page.
7. Migrate category/search pages.
8. Migrate product detail page.
9. Migrate cart/localStorage logic.
10. Migrate Swiper sections.
11. Migrate filters and previous searches.
12. Run build and browser tests.
13. Only after verification, remove obsolete vanilla entry points.

## Required route contract
Use:
- /
- /category/:categorySlug
- /search?q=:query
- /:categorySlug/:productSlug
- /cart

Product links must be generated from real product data:
`/${product.category.slug}/${product.slug}`

## Data layer
Create reusable API functions instead of fetching directly in every component.

Recommended:
- src/services/api.js
- src/services/productService.js
- src/services/categoryService.js

## State
Use local component state for UI-only state.
Use Context only for shared application state such as cart.
Keep localStorage synchronization in one place.

## Quality gate
Before declaring migration complete:
- npm run build succeeds.
- No console errors on main routes.
- Product detail URLs work on direct navigation.
- Refreshing a product detail URL does not break the app in development.
- Cart persists after refresh.
- Search query survives navigation.
- Swipers initialize only after their data exists.
- Responsive behavior remains functional.
