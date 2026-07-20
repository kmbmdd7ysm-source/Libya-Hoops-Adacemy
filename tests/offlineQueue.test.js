import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  backoffMs,
  enqueueMutation,
  queueClear,
  queueRead,
  replayQueue,
} from '../src/services/sync/offlineQueue';

describe('scoped offline queue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isolates mutations by authenticated user', () => {
    enqueueMutation('user-a', { id: 'a1', type: 'state' });
    enqueueMutation('user-b', { id: 'b1', type: 'state' });

    expect(queueRead('user-a').map((item) => item.id)).toEqual(['a1']);
    expect(queueRead('user-b').map((item) => item.id)).toEqual(['b1']);
    expect(queueRead(null)).toEqual([]);
  });

  it('deduplicates mutation IDs within the same user scope', () => {
    enqueueMutation('user-a', { id: 'same', type: 'state' });
    enqueueMutation('user-a', { id: 'same', type: 'state' });
    expect(queueRead('user-a')).toHaveLength(1);
  });

  it('never executes another user mutation', async () => {
    enqueueMutation('user-a', { id: 'a1', type: 'state' });
    enqueueMutation('user-b', { id: 'b1', type: 'state' });
    const handler = vi.fn();

    await replayQueue('user-a', handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].id).toBe('a1');
    expect(queueRead('user-b')).toHaveLength(1);
  });

  it('retains failed mutations with retry metadata', async () => {
    enqueueMutation('user-a', { id: 'a1', type: 'state' });
    const now = vi.fn(() => Date.now() + 1000);

    const result = await replayQueue(
      'user-a',
      async () => {
        throw new Error('temporary');
      },
      { now },
    );

    expect(result.failed).toBe(1);
    const [mutation] = queueRead('user-a');
    expect(mutation.attempts).toBe(1);
    expect(mutation.lastError).toContain('temporary');
    expect(mutation.nextRetryAt).toBeGreaterThan(now());
  });

  it('does not replay before nextRetryAt', async () => {
    enqueueMutation('user-a', {
      id: 'a1',
      type: 'state',
      nextRetryAt: 5000,
    });
    const handler = vi.fn();

    await replayQueue('user-a', handler, { now: () => 1000 });

    expect(handler).not.toHaveBeenCalled();
    expect(queueRead('user-a')).toHaveLength(1);
  });

  it('removes a mutation only after confirmed success', async () => {
    enqueueMutation('user-a', { id: 'a1', type: 'state' });
    const handler = vi.fn().mockResolvedValue(undefined);

    const result = await replayQueue('user-a', handler);

    expect(result.processed).toBe(1);
    expect(queueRead('user-a')).toEqual([]);
  });

  it('supports explicit per-user cleanup on account deletion', () => {
    enqueueMutation('user-a', { id: 'a1', type: 'state' });
    enqueueMutation('user-b', { id: 'b1', type: 'state' });

    queueClear('user-a');

    expect(queueRead('user-a')).toEqual([]);
    expect(queueRead('user-b')).toHaveLength(1);
  });

  it('uses capped exponential backoff', () => {
    expect(backoffMs(0)).toBe(500);
    expect(backoffMs(1)).toBe(1000);
    expect(backoffMs(20)).toBeLessThanOrEqual(30 * 1000);
  });
});
