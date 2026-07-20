# Production Order Backend Deployment

This repository contains deployable source; it does not imply that any production Supabase project has been changed.

1. Create or select a staging Supabase project. Install the Supabase CLI and link the repository to staging, never directly to production for the first run.
2. Configure frontend variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never place `SUPABASE_SERVICE_ROLE_KEY` or `EDGE_RATE_LIMIT_SALT` in frontend variables or source.
3. Apply `supabase/schema.sql`, then migrations in filename order. The final order migration is `20260718_zz_atomic_inventory_reservation.sql`; it must run after `20260718_trusted_catalog_transactional_orders.sql`.
4. Run `npm run catalog:generate`. Review `supabase/generated/product_catalog.sql`, then apply it to staging. It upserts stable variants and archives removed variants rather than deleting historical references.
5. Set Edge secrets: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... EDGE_RATE_LIMIT_SALT=...`.
6. Deploy `create-order`, `create-guest-order`, and `lookup-guest-order`. Authenticated creation verifies the bearer session; guest creation permits COD only and is rate-limited in the database.
7. Verify RLS with two test users: each can select only their own orders/items; anonymous selects and all direct order writes must fail.
8. Place a staging authenticated COD order and verify the returned total equals catalog pricing even when a browser payload is modified.
9. Retry the same idempotency key and verify the same order number is returned with no duplicate rows or second inventory decrement.
10. Place a guest COD order, then verify lookup succeeds only with the exact normalized email and order number. Wrong or malformed input must return the same generic empty response.
11. Verify Account → Orders displays the authenticated order and that guest tracking exposes no address, email, database ID, or unrelated personal data.
12. Online payment remains unavailable until a real provider session and signed webhook are implemented. Never mark an order paid from a browser callback; only a verified provider webhook may change payment status.
13. Before production, place the project behind Supabase/API gateway protections and review rate limits. The included database limiter is a practical baseline, not a substitute for managed WAF/CAPTCHA protection under attack.
14. Rollback by undeploying the three functions and restoring the previous application release. Do not drop order/catalog tables. Database changes are additive; prepare a reviewed forward-fix migration for schema rollback.
15. Never test against real customer records. Use a separate staging project, synthetic emails, dedicated test users, unique idempotency keys, and delete only those synthetic rows after verification.

Run `npm run validate:cloud-readiness` before deployment. For local database/RLS execution, use `supabase start`, apply migrations, seed the generated catalog SQL, then run `supabase/tests/order_security.sql` and `supabase/tests/atomic_inventory_reservation.sql`. The atomic suite verifies successful and insufficient reservations, idempotency, unlimited inventory, rollback after downstream failure, concurrent final-stock checkout, and the non-negative inventory invariant.
