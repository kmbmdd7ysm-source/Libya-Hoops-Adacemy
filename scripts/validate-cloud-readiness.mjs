import fs from 'node:fs';
import path from 'node:path';
const required = [
  'supabase/migrations/20260718_trusted_catalog_transactional_orders.sql',
  'supabase/migrations/20260718_zz_atomic_inventory_reservation.sql',
  'supabase/functions/create-order/index.ts',
  'supabase/functions/create-guest-order/index.ts',
  'supabase/functions/lookup-guest-order/index.ts',
  'scripts/sync-product-catalog.mjs',
  'supabase/generated/product_catalog.sql',
  'docs/ORDER_BACKEND_DEPLOYMENT.md',
];
const errors = [];
for (const file of required) if (!fs.existsSync(file)) errors.push(`Missing ${file}`);
const migration = fs.readFileSync(required[0], 'utf8');
const inventoryMigration = fs.readFileSync(required[1], 'utf8');
for (const token of [
  'create table if not exists public.product_catalog',
  'create_order_transactional',
  'security definer set search_path',
  'revoke insert, update, delete on public.orders',
  'consume_edge_rate_limit',
])
  if (!migration.toLowerCase().includes(token.toLowerCase()))
    errors.push(`Migration missing: ${token}`);
for (const token of [
  'inventory_tracking boolean not null default true',
  'for update',
  'inventory_quantity = pc.inventory_quantity - requested.quantity',
  'v_updated_count <> v_tracked_count',
])
  if (!inventoryMigration.toLowerCase().includes(token.toLowerCase()))
    errors.push(`Atomic inventory migration missing: ${token}`);
const generated = fs.readFileSync('supabase/generated/product_catalog.sql', 'utf8');
if (!generated.includes('on conflict(variant_id) do update'))
  errors.push('Catalog sync is not deterministic/upserting');
if (!generated.includes("product_status='archived'"))
  errors.push('Catalog sync does not deactivate removed variants');
const frontendFiles = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else frontendFiles.push(p);
  }
}
walk('src');
for (const file of frontendFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (/SUPABASE_SERVICE_ROLE_KEY|service[_-]?role/i.test(text))
    errors.push(`Service role reference in frontend: ${file}`);
}
const env = fs.readFileSync('.env.example', 'utf8');
for (const name of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'])
  if (!env.includes(name)) errors.push(`Undocumented frontend env: ${name}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  'Cloud readiness validation passed: catalog, atomic inventory reservation, transaction RPC, guest endpoints, privilege hardening, sync tooling, and documentation are present.',
);
