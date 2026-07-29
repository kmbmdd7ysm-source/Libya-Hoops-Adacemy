# Final Pricing, Coming Soon & Online Training Update

## Completed
- Own The Game collection marked Coming Soon with no visible price or purchase action.
- Updated all requested apparel, compression, socks and backpack prices.
- All upcoming events now show Coming Soon with no public date.
- Added selectable access plans for LHA Flight, LHA Base and LHA Build.
- Updated all requested online-training prices and durations.
- Strength & Conditioning marked Coming Soon.
- Expanded bilingual descriptions, outcomes and curriculum details for online programs.
- Added catalog pricing/availability regression tests.

## Validation
- `node scripts/validate-data.mjs`: passed with 0 errors and 0 warnings.
- `node scripts/validate-commerce.mjs`: passed.
- Direct ES module import validation for products, training and events: passed.

Full npm test/build could not run in the isolated environment because the configured package registry did not provide one locked dependency. Existing source and package files were preserved.
