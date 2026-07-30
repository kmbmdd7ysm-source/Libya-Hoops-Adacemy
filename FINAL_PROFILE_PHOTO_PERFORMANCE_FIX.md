# Final profile photo and quality fix

- Profile photo now previews immediately after the native iOS **Done** action.
- The selected photo is resized and compressed for fast synchronization.
- Avatar data is saved to both `profiles.avatar_url` and Supabase auth metadata.
- Removing a photo clears both cloud sources.
- `accept="image/*"` restores the most reliable iOS photo-picker conversion path.
- The large hero video no longer starts from an initial/synthetic scroll event and uses `preload="none"`.
- Added a descriptive hero scroll link and a spec-shaped `/llms.txt`.
- Existing Vercel SPA rewrite, account sync, order sync, totals, design, media, products, and routes were preserved.
