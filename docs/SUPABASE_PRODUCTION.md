# Supabase production setup

1. Create a Supabase project and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Run `supabase/schema.sql`, then `supabase/migrations/20260716_production_accounts.sql` in the SQL editor.
3. Configure the Site URL and allowed redirect URLs for `/account`.
4. Enable email confirmation and configure SMTP before launch.
5. Verify RLS by signing in as two users: neither user may select/update the other's profile, addresses, or `user_state`.

Guest data remains local. On sign-in the app merges local and cloud state, deduplicates exact cart variant keys, caps quantities at stock, and writes the merged result. Cloud writes are debounced. BroadcastChannel keeps open tabs aligned. Payment information is never stored.
