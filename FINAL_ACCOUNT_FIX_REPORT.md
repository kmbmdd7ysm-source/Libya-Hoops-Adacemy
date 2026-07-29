# Final account and media reliability update

## Completed
- Restored Programs, Upcoming Events, and Online Training media from Etorkilha(4).
- Fixed default-address saving without depending on the missing `set_default_address` RPC.
- Preserved signup names in authentication metadata and reused them throughout the account profile.
- Persisted profile-name edits back to authentication metadata and the profiles table.
- Persisted profile photos through authentication metadata, including signup photos.
- Hardened Formspree order delivery with same-origin server delivery, JSON and form-encoded fallbacks, retries, and a local retry queue.
- Added a Supabase migration for reliable profile creation after signup.

## Validation executed
- `node --check api/formspree.js`
- `node --check src/services/formspree.js`
- `node --check src/services/account/addressService.js`
- `node --check src/services/sync/cloudState.js`
- `node scripts/validate-media.mjs` — 0 errors, 0 warnings
- `node scripts/validate-data.mjs` — 0 errors, 0 warnings

## Deployment requirement
Apply `supabase/migrations/20260729_account_reliability.sql` to the connected Supabase project so new accounts also receive their profile row automatically at database level. Email verification delivery additionally requires email confirmation and SMTP to be enabled in the Supabase project.
