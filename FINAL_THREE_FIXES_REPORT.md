# Final three production corrections

- Order notification now posts to the approved Formspree endpoint with a browser-compatible URL-encoded request and a complete plain-text order summary. Checkout does not show success or clear the cart if the notification is not acknowledged.
- Order tracking stores and renders canonical USD values separately from the exact customer display-currency snapshot. Older local LYD orders are migrated from the stored shipping-rate snapshot when possible.
- Arabic keeps semantic RTL attributes, while the mobile Safari viewport geometry is forced LTR and the application root remains RTL, preventing the exposed left-side gutter without changing Arabic content direction.

Verification: format, lint, TypeScript, 36 test files / 227 tests, data, commerce, brand, media, SEO, cloud-readiness, production build, and 54 static pages all passed.
