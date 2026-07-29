-- LHA launch inventory: active physical variants use L=1, XL=2, XXL=3 per colour.
-- Inventory is deducted only when payment_status becomes 'paid' or an admin confirms COD collection.
begin;

alter table public.orders add column if not exists inventory_committed_at timestamptz;

update public.product_catalog
set active = case when upper(coalesce(variant_data->>'size','')) in ('L','XL','XXL') then true else false end,
    inventory_tracking = true,
    inventory_quantity = case upper(coalesce(variant_data->>'size','')) when 'L' then 1 when 'XL' then 2 when 'XXL' then 3 else 0 end,
    availability_state = case when upper(coalesce(variant_data->>'size','')) in ('L','XL','XXL') then 'in_stock' else 'unavailable' end
where fulfillment_type = 'physical' and product_status='active';

create or replace function public.commit_inventory_on_confirmed_payment()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare item record; remaining integer;
begin
  if new.inventory_committed_at is not null then return new; end if;
  if not (new.payment_status='paid' or (new.payment_method in ('cash','cash_on_delivery','cod') and new.order_status='confirmed' and new.fulfillment_status='delivered')) then return new; end if;
  for item in select variant_id, quantity from public.order_items where order_id=new.id loop
    update public.product_catalog
      set inventory_quantity=inventory_quantity-item.quantity,
          availability_state=case when inventory_quantity-item.quantity<=0 then 'out_of_stock' when inventory_quantity-item.quantity<=2 then 'low_stock' else 'in_stock' end
      where variant_id=item.variant_id and inventory_tracking=true and inventory_quantity>=item.quantity
      returning inventory_quantity into remaining;
    if not found then raise exception using errcode='22023',message='insufficient_inventory'; end if;
  end loop;
  new.inventory_committed_at=now();
  return new;
end $$;

drop trigger if exists orders_commit_inventory on public.orders;
create trigger orders_commit_inventory before update of payment_status,order_status,fulfillment_status on public.orders
for each row execute function public.commit_inventory_on_confirmed_payment();

commit;
