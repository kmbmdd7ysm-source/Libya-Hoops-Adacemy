# Final order email and account rebuild

## Order notification
- Formspree endpoint: `https://formspree.io/f/mqerbqvd`
- Direct browser FormData delivery is attempted first, matching the newsletter/subscribe path.
- A Vercel `/api/formspree` serverless fallback is attempted second.
- Failed notifications are queued locally and retried on the next site load.
- The SPA rewrite now excludes `/api/*`, so the function is not replaced by `index.html`.

## Account creation
- Supabase signup retries transient network failures.
- Account errors now identify duplicate email, disabled signup, rate limiting, and incomplete database setup instead of only showing a generic message.
- The included migration is idempotent and creates/repairs profiles, profile metadata synchronization, addresses, and RLS policies.
- The auth trigger catches profile synchronization failures so a profile-table problem cannot abort creation of the authentication user after the migration is applied.

## Required Supabase step
Run `supabase/migrations/20260729_account_reliability.sql` once in the Supabase SQL Editor for the live project. Vercel deployment cannot apply a remote database migration by itself.
