# Supabase account setup

1. Create a Supabase project and run `supabase/schema.sql`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Configure site URL and email redirects in Supabase Auth.
4. Keep RLS enabled. Never put the service-role key in the frontend.
   Without credentials, account UI reports that cloud accounts are unavailable; guest cart/wishlist/compare remain functional.
