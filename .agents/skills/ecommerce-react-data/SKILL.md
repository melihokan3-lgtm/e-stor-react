---
name: ecommerce-react-data
description: Implement API fetching, loading states, error handling, filtering, search and recommendations for the React e-commerce application.
---

# E-commerce Data Skill

Use a small service layer for API communication.

Base API:
`https://api.escuelajs.co/api/v1`

Do not scatter raw fetch calls across every component.

## Required behavior
- Products can be fetched by list, category and slug.
- Search filters products based on the current query.
- Product details are loaded from the product slug.
- Recommendations can reuse a common ProductCard.
- Broken image URLs must have a fallback image.
- Every network request must have loading and error handling.

## Image handling
Create one reusable image fallback mechanism.
Do not duplicate `onerror` implementations everywhere.

## Search
Search state should be represented in the URL:
`/search?q=orange`

Previous searches should be stored locally only if the user has enabled/uses that feature.

## Filtering
Filters must derive from source data instead of mutating the original product array.

Use patterns such as:
`const filtered = products.filter(...)`

Never modify the original API array in-place just to render a filtered view.

## Performance
- Avoid duplicate API requests.
- Cache reusable data where appropriate.
- Do not fetch recommendations independently from every ProductCard.
