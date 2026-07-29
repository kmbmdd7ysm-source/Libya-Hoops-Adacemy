# Final cross-device/account/order/address hardening

- Production authentication no longer silently creates device-only local accounts.
- Supabase public configuration can load at runtime from `/api/public-config` when Vite build variables are unavailable.
- Supabase auth uses persistent PKCE sessions and normalized email sign-in.
- Checkout loads the signed-in customer's saved addresses, selects the default address, and allows switching addresses.
- Address cloud payload matches the existing `addresses` table (`line1`/`line2`) while UI reads remain backward compatible.
- Product pages display S, M, L, XL, XXL and 3XL; unavailable sizes remain visible, disabled and crossed out.
- Order notification uses the same direct Formspree route as Contact first, then server routes and retry queue.
- Order email payload includes customer, address, products, quantities, totals, currency, payment and order number.

Validation completed:
- validate:data: passed, 0 errors / 0 warnings
- validate:commerce: passed
- validate:brand: passed
- validate:media: passed, 0 errors / 0 warnings
- validate:seo: passed
- JavaScript syntax checks for changed service/API files: passed

Full npm install/build/browser tests could not run in the isolated build environment because its package mirror returned 404 for `zod-validation-error-4.0.2`.

Deployment requirements:
- Vercel must contain `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or server aliases `SUPABASE_URL` and `SUPABASE_ANON_KEY`).
- The Formspree form `mqerbqvd` must remain activated and configured to deliver to the store email. The code now uses the same endpoint and direct submission path as Contact.
