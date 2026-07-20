# Commerce country and currency

Canonical catalog and order values are stored in USD. The runtime USD-to-LYD rate is stored only in `public.commerce_settings` under `usd_to_lyd_rate`.

The browser reads it through the read-only `get_public_commerce_settings` RPC. The browser cannot update the setting or submit an exchange rate to order creation. Trusted order totals and Libya shipping conversion are recalculated inside `create_order_transactional`. If the rate cannot be loaded or is invalid, converted display values are unavailable and Checkout is blocked rather than using a separately maintained production fallback.

Because the project has not been deployed, the unpublished final migration was edited directly and renamed with the real 2026-07-18 date. For an already-deployed database, create a new forward migration instead.
