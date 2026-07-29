import { describe, expect, it } from 'vitest';
import { products } from '../src/data/products';
import { onlineTraining } from '../src/data/onlineTraining';
import { events } from '../src/data/events';

const byId = (items, id) => items.find((item) => item.id === id);

describe('final catalog pricing and availability', () => {
  it('uses requested physical product prices', () => {
    expect(byId(products,'p014').price).toBe(20);
    expect(byId(products,'p017').price).toBe(22);
    expect(byId(products,'p018').price).toBe(17);
    expect(byId(products,'p021').price).toBe(16);
    expect(byId(products,'p023').price).toBe(17);
    expect(byId(products,'p024').price).toBe(17);
    expect(byId(products,'p025').price).toBe(17);
    expect(byId(products,'p030').price).toBe(16);
    expect(byId(products,'p031').price).toBe(5);
    expect(byId(products,'p027').price).toBe(25);
    expect(byId(products,'p028').price).toBe(20);
  });
  it('marks the Own The Game collection as coming soon without a sellable price', () => {
    for (const id of ['p029','p032','p033','p034','p035','p036','p037','p038']) {
      expect(byId(products,id).available).toBe(false);
      expect(byId(products,id).price).toBe(0);
    }
  });
  it('uses the requested online training prices and options', () => {
    expect(byId(onlineTraining,'ot10').purchaseOptions.map(x=>x.price)).toEqual([25,280]);
    expect(byId(onlineTraining,'ot11').price).toBe(90);
    expect(byId(onlineTraining,'ot12').purchaseOptions.map(x=>x.price)).toEqual([15,40,65]);
    expect(byId(onlineTraining,'ot13').purchaseOptions.map(x=>x.price)).toEqual([20,50,100]);
    expect(byId(onlineTraining,'ot14').price).toBe(55);
    expect(byId(onlineTraining,'ot01').price).toBe(20);
    expect(byId(onlineTraining,'ot02').price).toBe(25);
    expect(byId(onlineTraining,'ot03').price).toBe(20);
    expect(byId(onlineTraining,'ot04').price).toBe(20);
    expect(byId(onlineTraining,'ot05').price).toBe(30);
    expect(byId(onlineTraining,'ot06').available).toBe(false);
  });
  it('marks all events as coming soon', () => {
    expect(events.every((event)=>event.comingSoon && event.status === 'closed')).toBe(true);
  });
});
