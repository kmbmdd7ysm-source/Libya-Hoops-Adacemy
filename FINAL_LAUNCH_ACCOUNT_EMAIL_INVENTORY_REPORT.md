# Final launch reliability update

## Account creation
- Added Supabase HTTPS and WebSocket origins to the production Content Security Policy.
- Normalized signup metadata (`full_name`, `name`, `display_name`, first and last name).
- Existing verification redirect remains on the production `/account` route.

## Order email
- Added a dedicated `/api/order-notification` Vercel function.
- Order delivery tries the server route first, then the same direct Formspree route used by Contact and Subscribe, then the original proxy.
- Endpoint: `https://formspree.io/f/mqerbqvd`.
- Full customer, address, item, amount, currency, payment and order-number details are included.

## Launch inventory
- Active physical products expose only L, XL and XXL.
- Per colour: L = 1, XL = 2, XXL = 3.
- Added `supabase/migrations/20260729_confirmed_inventory.sql` so stock is committed only after paid card orders or delivered/collected COD orders.

## Validation
- Data validation: passed with 0 errors and 0 warnings.
- JavaScript syntax checks for server/email services: passed.
- Full npm install/build could not run in the isolated environment because the configured package mirror returned 404 for `zod-validation-error-4.0.2`.
