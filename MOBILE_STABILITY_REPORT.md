# Mobile viewport stability pass

## Scope

The uploaded ZIP was treated as the only source of truth. No branding, products, prices, routes, commerce behavior, media, or accepted desktop layout were redesigned.

## Corrections

- Added a route/language-aware `ViewportGuard` that resets accidental document-level horizontal scroll after route changes, language changes, resizing, and device rotation.
- Added final mobile viewport containment for `html`, `body`, `#root`, `.site-shell`, and `#main-content`.
- Preserved intentional horizontal scrolling for category tabs, filter pills, account tabs, and comparison tables.
- Hardened media, form controls, flex children, grid children, overlays, long order numbers, and user-generated content against intrinsic-width overflow.
- Added RTL-specific viewport anchoring without changing the application reading direction.
- Corrected the online-training route used by the mobile containment E2E suite.
- Added an interaction-focused E2E scenario covering filters, the mobile menu, route changes, orientation recovery, and multiple phone widths.

## Verification completed

- Formatting: passed
- ESLint: passed
- TypeScript: passed
- Unit/integration tests: 38 files, 232 tests passed
- Data validation: passed
- Commerce validation: passed
- Brand validation: passed
- Media validation: passed
- SEO validation: passed
- Cloud-readiness validation: passed
- Production build: passed
- Static page generation: 54 pages generated

The Playwright browser binary was not available in the execution environment and could not be downloaded because outbound network access was unavailable. The expanded E2E tests are included and ready to run in GitHub/Vercel CI or locally with Playwright installed.
