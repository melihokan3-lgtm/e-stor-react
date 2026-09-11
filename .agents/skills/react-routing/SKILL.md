---
name: react-routing
description: Build and verify React Router routes for the e-commerce application, including category/product slug URLs and refresh-safe navigation.
---

# React Routing Skill

Use React Router.

## Required routes
- `/`
- `/category/:categorySlug`
- `/search`
- `/cart`
- `/:categorySlug/:productSlug`

## Product URL
The canonical product URL is:
`/${categorySlug}/${productSlug}`

Example:
`/electronics/sleek-wireless-headphone-inked-earbud-set`

Generate product links from product data, never hard-code them.

## Detail page
Read:
- `categorySlug` from `useParams()`
- `productSlug` from `useParams()`

Fetch the product by slug.

## Search
Read query with:
`new URLSearchParams(location.search).get("q")`

## Navigation
Use React Router's `Link` or `useNavigate`, not full-page `window.location` changes for internal navigation.

## Verification
Test:
- Home -> product
- Product -> home
- Product -> category
- Search -> product
- Product -> cart
- direct refresh of `/electronics/example-slug`
- browser back/forward

Do not change the public URL contract during migration.
