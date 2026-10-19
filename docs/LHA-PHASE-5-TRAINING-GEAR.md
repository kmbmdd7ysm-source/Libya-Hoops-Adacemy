# Libya Hoops Academy 2.0 — Phase 5 Training Catalogue and Apparel Presentation

**Date:** October 19, 2026  
**Status:** COMPLETE for training-catalogue and apparel presentation scope; Vercel production deployment independently verified READY. Secure paid digital fulfilment remains a separate unresolved integration.

## Non-negotiable rules
- Black/white and neutral grayscale application UI; authentic product photos and official logos retain their actual image colours.
- Do not invent training exercises, phases, weeks, durations, prices, download rights or availability.
- Protect customer payment and fulfilment data. A checkout record is **not** a verified automatic right to download a source document.

## Training catalogue audited
- **10 existing available academy systems**, unchanged product prices and SKU relationships.
- **1 academy system in preparation**, not purchasable.
- **5 externally supplied source-document previews**: PRO SPLIT, ABS EXERCISES, OVERTIME ATHLETE, UPPER / LOWER SPLIT, THE VERT CODE ELITE. All stay `available: false`, with `price: null`, no add-to-bag and no public file links. Original documents, copyright/distribution permission and final prices have not all been verified.
- The user's earlier `Overtime_Athlete_Basketball_Integrated_12_Week_Program.pdf` exists in ChatGPT Library. It is a related 12-week integrated document; it **must not** be silently substituted for the distinct source filename `OvertimeAthlete(2).pdf` recorded in the site. Other listed originals were not retrieved in this session.
- Source course detail pages expose source title/caption as a preview but never generate a download. This is intentionally not an operational digital-rights fulfillment system.

## Actual implementation
1. `src/data/trainingDiscovery.js`: bilingual athletic performance/strength/skills filters and exact durations derived from source `purchaseOptions` (or explicit duration for a single-price program); no invented pricing tiers.
2. `src/pages/OnlineTrainingPage.jsx`: new structured bilingual, responsive filtering UI with real result counts and reset/empty states. User-selected filters persist in URL, including across client rerenders and shareable links. Available, preparing and file-under-review categories are separated.
3. `src/components/training/TrainingCard.jsx`: multi-duration price comparison right on cards. Programs without multiple options show their regular existing price.
4. `src/pages/TrainingDetailPage.jsx`: clear review/non-download states; paid training details explain that digital access is not immediately unlocked by this page. Selected package is preserved in session storage across prerender-client remounts so the cart item is based on the visitor's actual selection, rather than reverting to the default tier.
5. Corrected the inconsistent `LHA Handle` four-week curriculum section heading from Weeks 3–6 to Weeks 3–4 in English and Arabic, without altering exercises or prices.
6. **More visible apparel/accessories in the homepage**: independent large editorial section immediately after the training/store three-path introduction, with grounded academy photos `/images/categories/clothing-hero-player.webp` and `/images/categories/accessories-hero-player.webp`; direct links to the real /shop/clothing and /shop/accessories listings. Clothing marked available; accessories treated as a collection preview with per-item availability, not falsely offered as in-stock. Existing product grid remains and continues using actual sellable items.
7. `src/styles/training-and-gear.css`: black/white/gray touch-first responsive cards, chips, comparison rows, and high-impact dual-image apparel storytelling; no artificial colored accents, logos unchanged.
8. No database mutation, new SKU, new price, actual order, paid transaction, or unauthorized media release was made.

## Verified source prices (USD)
- LHA Flight / Vert Code Elite: **1 month $25 / 12 months $280**.
- LHA Base / Bodyweight: **1 month $15 / 3 months $40 / 6 months $65**.
- LHA Build / Full Body Strength: **1 month $20 / 3 months $50 / 6 months $100**.
- The other seven currently available programs retain their existing single-price catalogue values, e.g. LHA Force $90, LHA Leg Drive $55, LHA Handle $20, Pure Shot $25.

## Tests performed in a Vercel sandbox
- Data validation, ESLint, TypeScript, 71 prerendered HTML page build: PASS.
- New Vitest training duration/price/safe-draft guard: **4/4 PASS**.
- Playwright selected site tests on current source: **21/21 PASS** (training filters English and Arabic, 3 distinct apparel/accessory viewports, selected 3-month tier $40 reaching actual shopping bag, source-file non-purchase, previous homepage and core shopping/order/training smoke).
- Production dependency `npm audit --omit=dev`: **zero known advisories** in the tested sandbox.
- Formatting: a local Prettier run adjusted nine changed files, but formatting differences were **not promoted** from the sandbox to GitHub; do not claim all new files are Prettier-clean in committed source. Existing repository-wide style debt remains.
- Tests used browser viewport emulation, not every physical mobile device. Original full unit suite remains partially failing from Stage 1 and is not waived.

## Delivery and rights limitations
- **No evidence yet of secure purchaser-specific post-payment file delivery** or rights to distribute all supplied training documents. Full Center Vision fulfillment/payment integration and authenticated downloadable content requires a separate audited implementation in Phases 6–8. Until verified, do not expose the private source PDFs via public URLs or claim instant downloads.
- The related Overtime Athlete PDF in the user's file library is not assumed to be commercially redistributable.

## Upcoming
- Phase 6: commerce, checkout, inventory, digital fulfillment and Center Vision order lifecycle.
- Phase 7–9: verified coaches/events/brand media, authenticated accounts, full SEO/a11y/visual/hardware QA.

## Confirmed production delivery (2026-10-19)
- Verified GitHub main source commit `459d75d6ae41106ea358a974cd00f3edd09fd196` was deployed to **Production READY** at [Vercel deployment inspector](https://vercel.com/kmbmdd7ysm-sources-projects/libyahoopsacademy/DS8Do4nQ98TPZRgiAfixW7hqnL8t).
- Public [homepage](https://www.libyahoopsacademy.com/) contains 'BEYOND THE COURT' / 'WEAR THE WORK.' with live category links /shop/clothing and /shop/accessories, and the four actually priced garment cards remain present.
- Public [training catalogue](https://www.libyahoopsacademy.com/online-training) shows 'FIND YOUR SYSTEM', goal and duration controls and distinct 'Training Files Under Review' previews. [PRO SPLIT](https://www.libyahoopsacademy.com/online-training/source-pro-split) displays its explicit non-purchase notice.
- Product-level selected-tier cart price was independently tested after a fresh rebuilt preview; **$40 for LHA Base 3 months**.
