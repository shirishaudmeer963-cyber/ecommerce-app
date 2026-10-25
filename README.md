# Shirisha Store

A responsive, frontend-only storefront built with HTML, CSS, and vanilla JavaScript.

## Run locally

Open `index.html` in a browser, or serve the project directory with any static web server. For example:

```text
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Included demo flows

- Product search and price sorting
- Persistent shopping bag using browser `localStorage`
- Quantity controls, item removal, subtotal, shipping, and total calculations
- Delivery form with native validation and an order confirmation reference
- Account forms with password-match validation
- Responsive catalog, bag, checkout, and account pages

## Prototype boundaries

This project has no API or database. The catalog and prices are static, the bag exists only in the current browser, checkout does not process payment or submit an order, and account access is not connected. Do not enter real personal or payment information. A production store needs server-side price and inventory validation, secure authentication, a payment provider, order persistence, privacy and security controls, and automated tests before launch.

## Project files

- `index.html`: product catalog and storefront
- `cart.html`: persistent shopping bag
- `checkout.html`: delivery form and demo order summary
- `login.html`, `register.html`: account-form prototypes
- `script.js`: catalog, bag, checkout, and form behavior
- `style.css`: shared responsive styles