# Libya Hoops Academy Production Hotfix Report

## Implemented

- Connected Contact Us to `https://formspree.io/f/mqerbqvd`.
- Connected Newsletter submissions to the same Formspree form.
- Added Formspree order notification after a successfully saved cash-on-delivery order, including the exact order number, customer, address, items, totals, currency and timestamp.
- Preserved order success even if the email notification service is temporarily unavailable; the order remains saved and the failure is logged.
- Added a safe USD→LYD fallback rate of 9 when cloud commerce settings are unavailable so product prices and COD checkout remain usable on deployment.
- Added online-training programs to the Favorites page alongside physical products.
- Added a local account fallback when Supabase environment variables are absent, while continuing to use Supabase automatically when configured.
- Stabilized mobile filter sheets so their white options panel appears above the backdrop and remains scrollable.
- Normalized product-card color dot size, alignment and containment.
- Added RTL viewport containment to remove the white strip/horizontal overflow in Arabic.
- Added focused regression tests for every hotfix area.

## Verification

- `npm ci`: passed.
- `npm run format:check`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- Unit/integration tests: 35 files, 220 tests passed, 0 failed.
- Data validation: passed with 0 errors and 0 warnings.
- Commerce validation: passed.
- Brand validation: passed.
- Media validation: passed with 0 errors and 0 warnings.
- SEO validation: passed.
- Cloud-readiness validation: passed.
- Production build: passed; 54 static HTML pages generated.

## Deployment note

For shared cross-device accounts and cloud order storage, configure the existing Supabase environment variables in Vercel. Without them, account creation works locally on the current browser/device and COD orders use the project's existing local fallback.
