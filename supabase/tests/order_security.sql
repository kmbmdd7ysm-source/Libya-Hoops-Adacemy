-- Executable with a local Supabase/Postgres test database after migrations and catalog seed.
begin;
select to_regclass('public.product_catalog') is not null as product_catalog_exists;
select to_regprocedure('public.create_order_transactional(uuid,text,text,text,uuid,jsonb,jsonb)') is not null as transaction_rpc_exists;
select has_table_privilege('anon','public.orders','INSERT') = false as anon_cannot_insert_orders;
select has_table_privilege('authenticated','public.orders','UPDATE') = false as users_cannot_update_orders;
select has_table_privilege('anon','public.orders','SELECT') = false as anon_cannot_list_orders;
select count(*) > 0 as catalog_seeded from public.product_catalog where active;
rollback;
