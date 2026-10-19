# Libya Hoops Academy — NEXT LEVEL / LHA 2.0
<!-- Persistent cross-chat project handoff; updated 2026-10-18. -->

## Owner's explicit requirements / تعليمات أساسية (2026-10-18)
- Upgrade **the entire Libya Hoops Academy website**, not only the home page. Design every route, section, component, word, spacing decision, form state, and mobile/desktop interaction deliberately.
- **Primary visual palette MUST be black and white** (الأسود والأبيض). Neutral grayscale may be used for hierarchy; **avoid strange, saturated, multicolored accents**. Respect the original logo/assets; any additional accent requires an explicit user decision. Do not adopt unrelated decorative colors from other properties.
- Minimal, refined, powerful, premium, basketball-first. Simpler to use than the present version. Fast, accessible, responsive, cohesive. No visual clutter, needless animations, placeholder sections, or misleading claims.
- Arabic and English have equal priority: real RTL/LTR layout, semantic parity, properly localized commerce labels, and consistent spelling "ليبيا هوبس أكاديمي" / "هوبس".
- Benchmark existing Shababuna and Legacy Hoops Agency **for quality only**; keep the academy identity unique.
- Keep working end-to-end; don't declare a stage complete until testing and production status support that claim.

## Project source and deployment
- GitHub: `kmbmdd7ysm-source/Libya-Hoops-Adacemy`; default branch: `main`.
- Vercel project: `libyahoopsacademy` under team `team_OtEJjpBmORM2lIB58BXBc6cU`, project `prj_ZFR0dy8sL2HkE2iVDNLz9LYhod4Y`.
- Public website: https://www.libyahoopsacademy.com/
- Architecture: React 18 / Vite / React Router; package.json pins Node 22.x (Vercel UI may show 24.x but project's `engines` currently governs builds).
- Build pipeline: `npm run validate:data && vite build && node scripts/generate-static-pages.mjs` via `npm run build`.
- Test/QA scripts: `npm run qa:fast`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run test:e2e`, `npm run test:a11y`, `npm run lighthouse`, `npm run qa:full`.
- DO NOT disclose API keys, account secrets, passwords, or private user info in these documents.

## The nine-stage roadmap (one stage at a time)
1. **Technical foundation and stable production**: fix build/runtime, verify main production deploy, check catalog, auth/checkout/order-tracking unaffected, run automated checks, document remaining blockers.
2. **Monochrome design system**: black/white/neutral grayscale palette; shared spacing grid, type scale, components, border and shadow rules, appropriate arabic/english typography; no exotic colors.
3. **Mobile-first responsiveness**: design and validate 320/375/390/430/768/1024/1440/1920px, touch targets, menu/header, search, drawer/filters, forms, checkout.
4. **Homepage**: dramatic yet lightweight basketball story, clear pathways to in-person programs, online training, store; original quality media; eliminate redundant sections and placeholders.
5. **Training catalogue and details**: show all actual supplied systems accurately, organized by goal and duration; precise source-grounded bilingual captions, prices, tier selection (1/3/6/12 months only where applicable), PDF/digital delivery and curriculum details. Never fabricate sets, weeks, sessions, availability, purchase rights or downloadable content.
6. **Shop/checkout**: improve grid, cards, product variants, size/availability, bag/checkout and order confirmation; preserve Center Vision authoritative SKU/pricing/stock and idempotent order creation.
7. **Academy content**: coaches, events, in-person programs, about, contact, partnerships, support, real photos and verified milestones; hide empty placeholders.
8. **Accounts, bilingual quality and support**: authentication, favorites, compare, orders, shipment tracking, messages and help; fine RTL/LTR details; accurate USD/LYD display.
9. **Polish, performance and release gates**: visual diff all routes, cross-device QA, a11y, SEO, Web Vitals, performance, commerce acceptance tests, release verification and monitoring.

## Issues identified before starting Phase 1
- Vercel production builds for commits `04f8afa`, `956a456`, `f7f554c` showed ERROR. Latest error: `ERR_MODULE_NOT_FOUND` on relative import in `src/data/onlineTraining.js`:
  - original: `import { suppliedTrainingCatalog } from './suppliedTrainingCatalog';`
  - fixed: `import { suppliedTrainingCatalog } from './suppliedTrainingCatalog.js';`
  - fix committed on main as `3560210c601406a925bcf847a30327802681ab10` (2026-10-18).
- Latest previously known successful production: `bcb6667f615e52855fa2a901262b3239795b34f3` (before the failed builds), not evidence that later changes are live.
- Site audit found `Media coming soon` placeholders across in-person programs, online training, shop, coaches and events; recurring catalog items need review; online-training curricula may show blank headings in text extraction; old event names and delivery/tracking messaging need verification.
- A read-only browser audit found desktop English/Arabic switch largely functioning and RTL good on inspected pages; isolated Arabic spelling inconsistency, and some training/shop visibility questions. **Mobile layouts have not yet been comprehensively verified**; do not claim they passed.

## Program catalog and commerce precautions
- Current online program catalog includes 11 offerings shown publicly. Preserve distinct duration and price choices per specific system; e.g., LHA Flight $25 monthly and $280/12 months; LHA Base $15/1mo, $40/3mo, $65/6mo; LHA Build $20/1mo, $50/3mo, $100/6mo. Verify against source data, not assumptions.
- Additional supplied training resources in `src/data/suppliedTrainingCatalog.js` are **draft / not for sale** until actual source review, verified contents, confirmed delivery assets and distribution permissions.
- Avoid false discounts, unverified session counts, arbitrary preorders or fabricated quantities.
- Center Vision is the intended source for authoritative product SKUs/prices/stock and order state. Preserve existing order integration, payment safety, and no duplicate orders.
- Do not make destructive production DB or checkout changes during a visual design pass.

## Phase status (update only after verification)
- Phase 1: **IN PROGRESS / BLOCKED ON QA** — Node ESM import fix `3560210` restored successful production deploys; latest verified prior deployment `ed0ca770` was READY. Full QA executed in Vercel sandbox: validation/data/lint/typecheck/build/brand/media/commerce/SEO/cloud-readiness PASS; unit tests 257 pass / 34 fail, 63 Prettier format failures, 2 moderate npm production advisories. Focused desktop E2E: 1 pass, 2 fail; full 1,656-case suite not completed and early accessibility failures observed. DO NOT mark stage complete. **Read the detailed verified report `docs/LHA-PHASE-1-QA-RESULTS.md` before any code changes or status claims.**
- Phases 2–9: **NOT STARTED**.
- Keep a concise actual change log with commit, deployment state, tests that were *actually run*, and remaining work. Never represent a proposed step as completed.

## Cross-chat continuation
When a future chat says "كمل ليبيا هوبس أكاديمي" or "LHA 2.0", load this repository document and inspect latest GitHub/Vercel state before coding. This repository file is a durable handoff and takes precedence over stale chat summaries when describing actual implementation status.
