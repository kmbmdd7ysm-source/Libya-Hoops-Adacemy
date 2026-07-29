# Final four fixes QA

- Hero play/pause overlay removed from markup. The poster is the immediate LCP asset; the background video is requested only after real user interaction and has no center icon.
- Signup no longer embeds the selected profile image inside Supabase Auth metadata. This removed the request-size failure that could make both account creation and later login fail. Authentication remains Supabase-backed and sessions are portable across devices after email verification.
- Runtime Supabase configuration accepts Vite, Next-public, legacy anon, and new publishable-key environment variable names.
- Order notification uses the Vercel server function first, with a compact URL-encoded Formspree payload, retries, two fallbacks, and a local retry queue. Checkout does not show success or clear the cart when notification delivery is rejected.
- External Google font requests were removed from initial rendering. Hero poster converted to WebP and preloaded. The 4.6 MB video is not downloaded by Lighthouse or before user interaction.

Validation executed in this environment:
- validate:data: passed
- validate:commerce: passed
- validate:media: passed
- validate:brand: passed
- validate:seo: passed
- Node syntax checks for server and notification modules: passed

Full dependency install/build could not run because the isolated npm mirror returned a 404 for a transitive package. Live Formspree delivery could not be network-tested because DNS access is disabled in this execution environment.
