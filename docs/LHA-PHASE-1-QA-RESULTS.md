# LHA 2.0 — Phase 1 Technical QA Report
**Date:** 2026-10-18 (America/New_York)
**Status:** PARTIAL / BLOCKED — production build recovered; full QA is NOT green.

## Verified production recovery
- Original broken production builds `04f8afa`, `956a456`, `f7f554c`: failed in `npm run validate:data` with Node ESM `ERR_MODULE_NOT_FOUND` in `src/data/onlineTraining.js`.
- FIX in commit `3560210c601406a925bcf847a30327802681ab10`: relative import updated to `./suppliedTrainingCatalog.js`.
- Deployment `dpl_CHuhFJXDZGxkFWuWXHRJMqBcSvaJ`: READY production.
- Durable project-handoff update `f484c3fd1714e4b43730f7cd8077b12b51c8688c` and status update `ed0ca770fceeb4f608eb16e6b4babca5e7491975`: READY production.
- Latest success at time of inspection: `dpl_H931UW8Qx3BwtpVYr9xbTyMh5fKL` (ed0ca770).
- Successful Vercel build generated 71 prerendered HTML pages.
- Read-only public pages reached: `/online-training`, `/online-training/source-pro-split`, `/online-training/vert-code-elite`, `/order-tracking`.

## Actual local QA performed on git revision ed0ca770 in isolated Vercel sandbox
- `npm ci`: PASS (sandbox Node 24/npm 11; production Vercel build uses Node 22 due package engines).
- `npm run validate:data`: PASS — 0 errors, 0 warnings.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS — 71 static HTML pages.
- `npm run validate:commerce`: PASS.
- `npm run validate:brand`: PASS, optional legacy favicon/apple-touch asset notices.
- `npm run validate:media`: PASS — 0 errors, 0 warnings.
- `npm run validate:seo`: PASS.
- `npm run validate:cloud-readiness`: PASS — static checks only, not proof live backend calls succeed.
- `npm test`: **FAIL** — 257 passed, 34 failed of 291 tests; 32 test files passed, 19 failed of 51. Not a green release gate.
- `npm run format:check`: **FAIL** — 63 pre-existing files flagged by Prettier; do not mass-format on production without reviewing changes.
- `npm run audit:production`: **FAIL** — 2 moderate advisories in current react-router/react-router-dom 6.30.4; available npm repair may require major-version upgrade; do not automatically force a potentially breaking upgrade.
- `npm run test:e2e`: browser initially unavailable in sandbox; installed Playwright Chromium and OS dependencies successfully. Full suite enumerated **1,656 test cases** across desktop/mobile/reduced-motion/Arabic and was stopped rather than waste resources after early accessibility failures. **NOT PASSED**.
- Focused browser tests on desktop ran for home/locale/deep-link, shop/wishlist/cart/checkout UI, and guest order verification: **1 passed, 2 failed**. Guest order detail email-verification guard passed. Home and shop/checkout flows failed, require root-cause investigation, not yet fixed.
- No real checkout, account registration or payment was performed. Cross-device authentic session, payment completion, integration callbacks and full mobile geometry remain **NOT VERIFIED**.

## Identified categories behind unit-test failures
1. **Address service (9 failures in `addressService.integration.test.js`)**: Tests expect cloud-required error propagation, atomic `set_default_address` RPC and no local fallback, while code now saves browser-local first and may swallow cloud errors. There is real cross-device consistency risk; do not rewrite blindly or delete users' local addresses.
2. **Money (4 failures `money.production.test.js` and other currency tests)**: Current `convertPrice` and `formatMoney` round LYD figures up to multiples of 5; tests expect exact 2-decimal math. Clarify display-only rounding versus accounting/store pricing and avoid unverified monetary policy changes.
3. **Catalog/events/media**: Legacy assertions reflect older pricing, imagery, asset names, status full vs closed for past event, service-worker revision, and exact implementation strings. Reconcile product/source-of-truth records before updating code or tests.
4. **Commerce/order notifications/account/hero/search**: Some test expectations fail against revised implementation. Investigate each and preserve safety/operations semantics.
5. **CSS/format/a11y**: Baseline tests and broad Prettier check not green. Audit issues should be fixed with measured, reviewed, separate patches.

## Source/database consistency findings
- Current `src/pages/OnlineTrainingPage.jsx` imports and renders **only** `suppliedTrainingPrograms` (5 draft cards); the other existing `onlineTraining` offerings remain in code but are absent from that listing. Public drafts correctly show Coming Soon and are not purchasable. This is a catalog exposure/UX issue, not permission to guess prices or sell unverified files.
- Attached-file sourced training catalog remains marked draft until source content, verified prices/delivery files and commercial rights are established.
- Read-only Supabase inspection: connected 'Libya hoops academy' project was ACTIVE_HEALTHY; `profiles`, `user_state`, `addresses` tables have owner-scoped RLS policies. No public function matching address/default RPC name was found, so legacy test's expected RPC is not currently confirmed present. Avoid inventing functions or issuing SQL writes without a separate reviewed plan.
- Vercel project settings show Node 24 but `package.json` enforces Node 22 in production; reconcile settings, document reason.

## Non-negotiable visuals for future phases
**BLACK + WHITE primary only**; neutral grayscale for hierarchy. No strange, bright or arbitrary decorative colors. Retain exact brand imagery/logos. Finish all routes on mobile and desktop, Arabic and English with correct RTL.

## Remaining phase 1 acceptance work — NOT DONE
- Trace and repair 34 unit failures **without** making tests pass by disabling assertions or changing verified store data.
- Confirm account/address cloud persistence, owner permissions and atomic default-address behavior in isolated tests; don't alter production user data.
- Verify accurate currency policy, order subtotal/shipping and no duplicate order creation; check actual Center Vision order integration in staging.
- Fix package advisories with a reviewed compatibility plan, then rerun tests.
- Fix focused home/shop E2E failures and a11y tests, then run bounded responsive/mobile suites.
- Triage Prettier debt and apply reviewed formatting without overwhelming unrelated changes.
- Confirm verified production smoke and complete handoff updates. Keep Phase 1 marked **IN PROGRESS**, not complete, until gates are green.

## Additional live-production browser smoke (2026-10-18)
A separate **read-only browser run of the actual public production website** successfully:
- Loaded homepage, shop, product details, cart and checkout route without observed JavaScript/navigation crashes.
- Switched Arabic and English in both directions without observed errors.
- Opened **LHA Win Tee** product page, chose white / XL, clicked **Add to Bag**, observed populated cart drawer and cart page.
- Switched USD to LYD, saw $20 represented as LYD 180 in UI; requires separate confirmation of intended pricing/rounding policy.
- Observed checkout guest/sign-in/create-account choices but **did not enter personal data or submit a real order/payment**. Authenticated checkout, guest form submission, payments and final order persistence remain UNVERIFIED.
- Saw 5 supplied training source drafts labelled Coming Soon, not available for purchase.
- This public-site smoke is valuable but **does not cancel the two focused local Playwright failures**; selectors/test assumptions vs actual behavior need reconciliation.
- Browser run id: `fe910527-fee7-4582-8ef1-ed7014073cdf`, accessible at https://agent.tinyfish.ai/runs/fe910527-fee7-4582-8ef1-ed7014073cdf

## Additional environment fix (2026-10-18)
- Set Vercel `libyahoopsacademy` project `nodeVersion` to `22.x` to match `package.json` engines; independently read back the project and confirmed `22.x`. This is a production project configuration adjustment, not a new app feature. Existing production deployment remained READY.

## Change-safety policy
No destructive database mutations, no fabricated inventory/registration dates/training session counts, no automatic public sale of draft licensed content, no uncontrolled major version upgrades, no real purchases during smoke testing.

## Phase 1 follow-up — implementation and verification (2026-10-18, continued)

### Live fixes shipped
- **Online training catalog exposure restored**: `src/pages/OnlineTrainingPage.jsx`, commit `4300cc5fbe344bd84eb9d20076bf8befddbcc1b3`. Public listing now separates **10 existing available programs** from **6 Coming Soon systems** (one existing program plus 5 supplied draft-source previews). Existing prices/options unchanged and drafts cannot be added to cart. Verified production content on `/online-training`; the five source document previews remain non-purchasable.
- **Cross-device address cache consistency**: `src/services/account/addressService.js`, commit `52425b583679515e2b0cfe8342b08a1a84fd5a30`. A successful empty cloud address list now overwrites stale local cache; permission/network errors while online are no longer hidden by returning old locally cached records. No production DB data altered.
- Tests `e2e/online-training-catalog.spec.js` (`f8b0a9c`) and `tests/addressCacheConsistency.test.js` (`95875f3`) added; cache unit tests 2/2 PASS. Catalog test PASS on desktop, mobile, and Arabic-RTL **test project**; note that project locale alone does not prove real UI language selection.
- Corrected pre-existing browser test mistakes in `e2e/core-flows.spec.js`: remove `localStorage.clear()` on every reload; select a product actually showing Quick Add (instead of the first Coming Soon product); proceed through required guest checkout selection; target visible country picker instead of hidden input; do not click an already-open picker closed. Changes across commits `4e9ffee`, `9ac9b6c`, `d763eb2`, `c3927aa`, `434363a`. Existing live shopping functionality was not altered by test updates.

### Verification after fixes
- Latest focused Playwright **desktop** run: **4 passed / 0 failed**: homepage currency persistence + RTL/deep links; shop/favorites/compare/cart and guest checkout country/cash controls; guest order email-verification gate; online training available/draft separation. Ran on local preview from current repository code.
- Training-catalog Playwright run: **2 passed** on `mobile-chromium` and `arabic-rtl` test projects; earlier desktop program test also passed.
- `npm run validate:data`, `npm run lint`, `npm run typecheck`, `npm run build` PASS on training-catalog change; Vercel production deploys continued READY.
- Full Vitest after address-cache fix: **260 passed / 33 failed (293 tests across 52 files)**, previously 257 passed / 34 failed (291 tests across 51 files). The remaining failures are NOT resolved and must not be removed or ignored just to turn the badge green.
- Separate `tests/addressService.integration.test.js` still reports 8 failing expectations tied to cloud-first / atomic RPC design versus the current offline/local-first implementation. A successful read fix is not proof that create/update/delete/default flows persist cross-device correctly.
- Prior audits still outstanding: 2 moderate React Router dependency advisories, 63 Prettier-flagged files, complete accessibility/mobile suite, authenticated cloud save/delete/default flow, payment completion, Center Vision end-to-end order status. No real payment or real customer order was placed.

### Next strict steps
1. Fix verified address write/default-address atomicity in a reviewed backend/API change, preserving RLS and no destructive changes. Check real cloud persistence and fallback policy; do not assume that passing isolated cache tests proves the whole service.
2. Audit checkout/price formatting and USD/LYD rounding vs accounting; do not silently redefine sales amounts. Investigate other 33 Vitest failures one by one and update obsolete assertions only with evidence.
3. Address 2 moderate React Router advisories after a compatibility test of any major upgrade; never force install into production without full regression.
4. Work through measured a11y/mobile failures and stale formatting separately; never claim the 1,656-case comprehensive Playwright suite passed.
5. Finish Phase 1 only after production and regression gates are documented green.

**Design invariant for stages 2–9: primary palette BLACK + WHITE, neutrals only, no strange or bright decorative colors, bilingual Arabic/English, mobile first.**
