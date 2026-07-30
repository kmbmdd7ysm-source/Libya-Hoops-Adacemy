# Final mobile performance hardening

This pass keeps all account, profile-photo, cross-device order, total-price, Supabase, Vercel route, product, media and visual behavior from the supplied archive.

## Mobile critical-path changes

- Split all below-the-fold home collections into a lazy module that loads shortly before the visitor scrolls to it.
- Lazy-load the search engine, cart drawer and footer/newsletter only when required.
- Added a 960px, ~20 KB mobile hero poster and responsive preload selection.
- The 4.6 MB cinematic video is now a desktop-only enhancement and remains `preload="none"`.
- Removed initial route forced-layout work and mobile hero entrance-animation delay.
- Deferred anonymous Supabase initialization, geolocation lookup, service-worker installation and retry-queue work until real interaction.
- The exchange-rate cloud request still runs whenever LYD or an authenticated profile needs it; the existing safe 1 USD = 9 LYD fallback remains unchanged.
- Added descriptive text to the mobile-menu home logo link.
- Updated the service-worker cache version and included the mobile poster.

## Validation completed

- JavaScript/JSX parse check: 207 files, 0 parse diagnostics.
- Source, data, commerce, media, SEO and cloud-readiness validators: passed.
- Static initial dependency graph reduced from about 375 KB / 73 source modules to about 191 KB / 45 source modules before minification and gzip.

A production Lighthouse number is generated only after deployment and can vary between runs because PageSpeed also measures server and network conditions.
