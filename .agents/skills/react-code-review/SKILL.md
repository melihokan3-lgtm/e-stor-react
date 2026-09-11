---
name: react-code-review
description: Review React e-commerce code for correctness, maintainability, performance, accessibility and security before finishing a task.
---

# React Code Review Skill

Before finishing a task, inspect the changed files.

## Correctness
- No undefined variables.
- No stale state bugs.
- No missing effect dependencies.
- No duplicate event listeners.
- No unnecessary fetch loops.
- No broken imports.
- No invalid JSX.

## React quality
- Components have focused responsibilities.
- Reusable UI is extracted.
- Lists use stable keys.
- State is kept at the correct level.
- API logic is separated from presentation.

## Accessibility
- Images have useful alt text.
- Buttons are buttons.
- Links are links.
- Form inputs have labels or accessible names.
- Keyboard navigation works.
- Interactive controls have visible focus states.

## Performance
- Avoid unnecessary re-renders.
- Avoid fetching identical data repeatedly.
- Lazy-load heavy page components when useful.
- Do not initialize multiple Swiper instances accidentally.

## Security
Apply the rules from `react-ecommerce-security`.

## Final checks
Run:
- formatter if configured
- linter if configured
- build
- browser smoke tests
