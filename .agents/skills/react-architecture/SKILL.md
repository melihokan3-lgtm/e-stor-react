---
name: react-architecture
description: Enforce scalable React architecture, reusable components, naming conventions and maintainable project structure for the e-commerce app.
---

# React Architecture Skill

Use a scalable feature-oriented React architecture.

## Preferred structure

src/
  app/
    App.jsx
    router.jsx
  assets/
  components/
    common/
    layout/
    product/
    swiper/
    search/
    cart/
  features/
    products/
    categories/
    search/
    cart/
  pages/
    Home/
    Category/
    Search/
    ProductDetail/
    Cart/
  services/
    api.js
    productService.js
    categoryService.js
  hooks/
  context/
  utils/
  styles/

## Naming
- React components: PascalCase
- hooks: useSomething
- utility functions: camelCase
- constants: UPPER_SNAKE_CASE only when genuinely constant
- CSS classes: use one consistent convention; prefer BEM-style for existing project compatibility.

Examples:
- ProductCard.jsx
- ProductGallery.jsx
- ProductRecommendations.jsx
- useProducts.js
- cartContext.jsx

## Component rules
- Components should have one clear responsibility.
- Avoid giant page components.
- Reusable product cards must be shared instead of duplicated.
- Do not copy the same JSX into multiple Swiper sections.
- Pass product data through props.
- Keep API calls outside presentational components.

## React rules
- Use `key={product.id}` for product lists.
- Never use array index as key when product IDs exist.
- Avoid unnecessary `useEffect`.
- Never manipulate the DOM manually when React can express the same behavior.
- Clean up subscriptions/listeners in effects.
- Handle loading, empty and error states explicitly.

## CSS
- Preserve existing visual language during migration.
- Avoid inline styles for reusable styling.
- Keep responsive breakpoints centralized.
- Do not introduce Tailwind unless the user explicitly asks for it.
