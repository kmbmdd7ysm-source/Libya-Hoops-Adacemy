# LHA 2.0 — Phase 4: Homepage Experience

**Date:** October 18, 2026  
**Status:** COMPLETE within Phase 4 scope; production deployment independently confirmed READY.

## Design and content rules
- Academy-first storytelling; black, white and grayscale UI only.
- Use the academy's **existing** project media, not invented imagery or fabricated player/coach achievements.
- Equal English and Arabic content, readable RTL, touch-first responsive design.
- Existing product availability, prices, inventory and checkout integrations left unchanged.

## Delivered
1. **Hero upgrade** in `src/components/experience/CinematicHero.jsx`: existing official poster and video remain; three clear pathways to `/programs`, `/online-training` and `/shop`. Users can pause/resume the background video via an accessible control. Reduced-motion / data-saver settings retain the static-poster fallback.
2. **Three editorial entry paths** in `src/pages/HomePage.jsx`: On-Court Training, Train Anywhere and Carry the Culture. Each has grounded bilingual copy, a verified local image, accessible link text and a direct route. Empty marketing metrics (such as generic 360-degree stats) are removed.
3. **Simplified homepage sections** in `src/pages/HomeDeferredContent.jsx`: in-person programs → actually available digital plans → gear → academy philosophy → contact/academy join CTA. Existing source data is used without invented prices, dates or coach profiles.
4. **Removed misleading homepage placeholders**: coach section is empty in the authoritative data and no longer appears on the homepage. Past/closed 2026 event listings that were still marked `comingSoon` are no longer promoted as upcoming on the homepage. Dedicated events/coaches routes remain unchanged for later work.
5. **Homepage-only CSS** `src/styles/home-experience.css` is imported after the global/responsive foundation. Premium monochrome contrast, measured whitespace, poster overlays, custom 3-column/1-column media pathways, language-aware typography, touch geometry, reduced-motion handling and focus indicators.
6. Maintained intersection-based deferred loading for below-fold content and the existing high-priority static hero poster.

## Source assets verified
- `/media/hero/lha-hero-poster.webp`
- `/media/hero/lha-hero-poster-mobile.webp`
- `/media/hero/lha-hero.mp4`
- `/images/programs/elite-development.webp`
- `/images/training/full-body-strength.jpg`
- `/images/categories/clothing-hero-player.webp`

## Sandbox quality gates
- `npm ci`: PASS.
- Data validation, commerce validation, media validation and SEO validation: PASS.
- ESLint and TypeScript: PASS.
- Vite build: PASS, **71 static HTML pages**.
- `npm audit --omit=dev`: PASS (0 known production vulnerabilities).
- `e2e/home-experience.spec.js`: **11/11 PASS** including image loading, routing, English/Arabic layout, 320/390/768/1440 viewports, video pause/resume and reduced motion.
- Focused regression `responsive-matrix.spec.js`, `core-flows.spec.js`, `online-training-catalog.spec.js`: **20/20 PASS**. This includes cross-page viewport containment and representative commerce/training routes.
- New files formatted via Prettier in QA sandbox and matching source was committed back to the branch.

## Not covered by Phase 4
- No assertion that original video shows a particular BAL training scene; it is the existing media file, not new sourced imagery.
- No complete payment, profile-address synchronization or full 1,600+ accessibility/visual suite claim. Remaining stage-1 QA debt is preserved.
- Training document content and sale rights = Stage 5. Full checkout/account cloud integration = Stages 6–8. Events/coaches details = Stage 7.

## Next step
Merge tested branch `lha-phase4-home-20261018` to `main`; independently verify Vercel production READY, then mark this stage delivered in the master handoff and proceed to Stage 5.

## Production release, after final merchandising correction
- First homepage redesign merged from branch `lha-phase4-home-20261018` to `main` (commit `928472dc62fe87ad9bf2636d9a04ec60974d7a9e`), deployed Production READY.
- Live homepage smoke discovered that all eight featured items in source data were not yet available for sale. That meant the first hero store shelf promoted only `Coming Soon` stock.
- **Corrected without altering SKU, stock or prices:** homepage now filters its merchandising sources to products with `available !== false`, no `comingSoon`, `availability === 'in-stock'`, and verified positive price. Picks ready featured items first, otherwise ready new arrivals, otherwise any ready products. No change to catalogue selection elsewhere.
- Source records contain 14 in-stock and sale-ready items; the first four displayed after correction are LHA Win Tee ($20), LHA Troops Tee ($20), LHA Hoopers Tee ($20), LHA Hoopers Long Sleeve ($22). Prices are read from the source.
- Added regression `e2e/home-experience.spec.js` checks for four Quick Add affordances and zero Coming Soon status chips in the homepage shelf.
- Fresh polish sandbox build/lint/typecheck PASS, focused Playwright **14/14 PASS**. A separate browser scroll diagnostic on program, online training and merchandise cards found image fallback count 0 and actual image `naturalWidth` 960, 960 and 900 pixels respectively.
- The external non-scrolling content extractor still surfaced six `Media coming soon` strings on deferred cards, but an on-scroll browser test demonstrated loaded, non-fallback images. This is not evidence of broken assets for actual scrolled visitors; any crawler-level discrepancy should be revisited during SEO/a11y phase 9.
- Exact corrected production commit `029b46b8fcace0892ae36fadb458c732198add5e`, Vercel deployment `dpl_vL6XunaRBPZ3XZpfiyp9xK6Kmrit` **READY**. Live public homepage independently fetched: hero and all three routes present; merchandise section now contains four priced products and **zero `Coming Soon`** marketing cards.
- Live production: https://www.libyahoopsacademy.com/
- Production deployment: https://vercel.com/kmbmdd7ysm-sources-projects/libyahoopsacademy/vL6XunaRBPZ3XZpfiyp9xK6Kmrit
