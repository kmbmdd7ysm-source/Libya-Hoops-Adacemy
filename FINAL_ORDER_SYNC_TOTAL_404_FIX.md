# Final Order Sync, Total, and Refresh Fix

## Scope

This update changes only order synchronization, order-total presentation,
private order-page caching, and Vercel SPA refresh routing.

## Fixed

1. Authenticated cash-on-delivery orders are copied into the signed-in user's
   existing Supabase `user_state.preferences.orderHistory` record. This gives
   the account cross-device order history even when optional Supabase Edge
   Functions or the separate `orders` table are not deployed.
2. Existing local orders are promoted to cloud history the next time the same
   signed-in account opens My Orders on the device that placed the order.
3. Cloud order history is merged with structured `orders` table results and
   local history without duplicates.
4. General account-state writes preserve `orderHistory`, so cart and profile
   synchronization cannot erase orders.
5. Order cards now display `displayTotal` with `displayCurrency`, matching the
   exact total shown in Order Details.
6. Vercel SPA refreshes now route to `/` instead of `/index.html`, while
   `/api/*` remains excluded.
7. Account, checkout, and order-tracking pages are network-only in the service
   worker and are not stored in public page caches.

## Supabase requirement

No new table is required. This fix uses the existing RLS-protected
`user_state` table created by the LHA account setup SQL.

## Deployment

Upload the complete repository, commit it to the same GitHub branch connected
to Vercel, and wait for the new production deployment to become Ready. Do not
replace only the `dist` folder.

After deployment, sign in on the device containing the existing local order
and open **Account → Orders** or **My Orders** once. The old local order is then
promoted to the cloud and appears on other devices using the same account.

## Validation completed

- All 199 JavaScript, JSX, TypeScript, and TSX source/test files passed syntax
  parsing.
- Content, commerce, brand, media, SEO, cloud-readiness, and source validators
  passed.
- A runtime simulation confirmed that a signed-in COD order saved on one
  device loads from Supabase `user_state` on a second device with the exact
  `displayTotal` preserved.
- A second runtime simulation confirmed promotion of a previously local-only
  order into cross-device cloud history.
- The Vercel rewrite was checked against `/account`, nested order routes,
  `/shop`, and `/api/public-config`; application routes match while the API
  route remains excluded.

A full `npm ci` / Vite production build could not be rerun in this environment
because the configured package registry returned HTTP 404 for
`zod-validation-error-4.0.2.tgz`. This is an external dependency-registry
limitation, not a source-code validation failure.
