import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const migrationPath = 'supabase/migrations/20260718_zz_atomic_inventory_reservation.sql';
const sql = fs.readFileSync(migrationPath, 'utf8').toLowerCase();

describe('atomic inventory reservation migration', () => {
  it('locks and re-checks authoritative inventory inside the order transaction', () => {
    expect(sql).toContain('for update');
    expect(sql).toContain("message='insufficient_inventory'");
    expect(sql).toContain('pc.inventory_quantity >= requested.quantity');
  });

  it('decrements inventory before writing the order and order items', () => {
    const decrement = sql.indexOf(
      'set inventory_quantity = pc.inventory_quantity - requested.quantity',
    );
    const orderInsert = sql.indexOf('insert into public.orders');
    const itemInsert = sql.indexOf('insert into public.order_items');
    expect(decrement).toBeGreaterThan(-1);
    expect(orderInsert).toBeGreaterThan(decrement);
    expect(itemInsert).toBeGreaterThan(orderInsert);
  });

  it('preserves idempotency and handles duplicate-race rollback', () => {
    expect(sql).toContain('idempotency_key = p_idempotency_key');
    expect(sql).toContain('when unique_violation then');
    expect(sql).toContain("'duplicate',true");
  });

  it('supports explicit unlimited inventory without decrementing it', () => {
    expect(sql).toContain('inventory_tracking boolean not null default true');
    expect(sql).toContain('pc.inventory_tracking = true');
    expect(sql).toContain('inventory_tracking = false and inventory_quantity is null');
  });

  it('aggregates duplicate lines and prevents negative inventory', () => {
    expect(sql).toContain('group by variant_id, product_id');
    expect(sql).toContain('sum(quantity)::integer');
    expect(sql).toContain('inventory_quantity >= requested.quantity');
    expect(sql).toContain('v_updated_count <> v_tracked_count');
  });
});
