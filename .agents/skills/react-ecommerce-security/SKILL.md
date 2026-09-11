---
name: react-ecommerce-security
description: Apply secure React e-commerce coding practices for authentication, payments, API keys, XSS prevention, storage and checkout boundaries.
---

# React E-commerce Security Skill

Security rules are mandatory.

## Secrets
- Never place secret API keys, payment secret keys, database passwords or private tokens in React source.
- Anything exposed through Vite `VITE_*` variables is public to the browser.
- Secret operations must happen on a backend/serverless function.

## Payment
The React frontend may create a checkout request, but it must never calculate or authorize a payment using secret credentials.
Use a trusted backend/payment provider for:
- payment intent creation
- webhook verification
- order confirmation
- refunds
- secret API keys

Never trust price or total values received from the browser. Recalculate authoritative totals server-side.

## XSS
- Prefer JSX text rendering.
- Avoid `dangerouslySetInnerHTML`.
- If HTML must be rendered, sanitize it first.
- Never inject unsanitized API content into raw HTML strings.

## localStorage
Do not store:
- passwords
- payment card numbers
- CVV
- private authentication tokens

A client-side cart may be stored in localStorage, but the backend must validate product IDs, prices and quantities during checkout.

## Auth
- Prefer secure, HttpOnly cookies for sensitive session credentials when a backend exists.
- Never put long-lived private credentials in localStorage.

## API
- Validate all user-controlled route/query parameters.
- Handle API failures safely.
- Do not expose internal error details to end users.

## Checkout
The browser is untrusted.
The server is authoritative for:
- product price
- stock
- discounts
- tax
- shipping
- order total
- payment status

## Dependency hygiene
Run package audit and keep dependencies updated, but do not blindly apply breaking upgrades.
