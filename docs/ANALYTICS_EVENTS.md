# Consent-gated analytics

All events use `src/utils/analytics.js`. Providers initialize only after analytics consent. Payloads remove keys containing password, address, email, phone, token, or secret; strings are truncated and email/phone patterns are masked.

Supported event families include page_view, product_view, gallery_open, media_zoom, video_play, video_complete, variant_select, add_to_cart, remove_from_cart, cart_quantity_changed, wishlist_add/remove, comparison_add/remove, search, filter, sort, recommendation_click, program_view, player_view, coach_view, event_view, newsletter_submit, language_changed, pwa events, authentication completion, profile_updated, sync_error, offline/online, and checkout_started.

Clarity must be configured to mask all inputs and exclude account, authentication, address, password-reset, and checkout-sensitive routes. Consent withdrawal removes loaders and disables future events; provider deletion limitations must be handled in the provider dashboard.
