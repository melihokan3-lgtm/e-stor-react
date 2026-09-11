---
name: react-testing-playwright
description: Verify the React e-commerce application with build checks, browser tests and regression checks using Playwright.
---

# React Testing Skill

After meaningful changes, verify the application.

## Required checks
1. Install dependencies successfully.
2. Run the production build.
3. Start the local dev server.
4. Open the application in a browser.
5. Check console errors.
6. Check broken images.
7. Check responsive layouts.

## Critical flows
- Home loads.
- Product cards render.
- Product card opens `/category/product-slug`.
- Product detail loads after direct URL navigation.
- Gallery thumbnails switch the main image.
- Add to cart updates cart count.
- Refresh preserves cart.
- Search navigates to `/search?q=...`.
- Previous searches appear only when appropriate.
- Filters update visible products.
- Swiper controls work.
- Cart page loads saved items.

## Regression rule
Do not declare a migration complete based only on `npm run build`.
The browser behavior must also be checked.

## Failure reporting
When a test fails, report:
- route
- action
- expected result
- actual result
- likely source file
- minimal fix
