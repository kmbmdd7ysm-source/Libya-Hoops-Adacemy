import { afterEach, describe, expect, it, vi } from 'vitest';
import { createChannel, safeRead, safeRemove, safeWrite } from '../src/services/sync/storage';

describe('defensive storage primitives', () => {
  afterEach(() => vi.restoreAllMocks());

  it('handles malformed JSON and unavailable storage safely', () => {
    localStorage.setItem('broken', '{');
    expect(safeRead('broken', ['fallback'])).toEqual(['fallback']);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('quota');
    });
    expect(safeWrite('x', 1)).toBe(false);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
      throw new Error('blocked');
    });
    expect(safeRemove('x')).toBe(false);
  });

  it('deduplicates cross-tab messages and ignores its own messages', () => {
    const received = [];
    const channel = createChannel('test-channel', (message) => received.push(message));
    const own = channel.post('sync', { value: 1 });
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: '__bc__:test-channel',
        newValue: JSON.stringify(own),
      }),
    );
    const external = { ...own, messageId: 'external-1', originTabId: 'other-tab' };
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: '__bc__:test-channel',
        newValue: JSON.stringify(external),
      }),
    );
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: '__bc__:test-channel',
        newValue: JSON.stringify(external),
      }),
    );
    expect(received).toEqual([external]);
    channel.close();
  });
});
