import { describe, expect, it } from 'vitest';
import {
  events, publishedEvents, getEvent, upcomingEvents, pastEvents,
  featuredEvents, isEventEnded, canRegister,
} from '../src/data/events.js';

describe('events are public only after their details are verified', () => {
  it('does not publish any of the five old editable demo events', () => {
    expect(events).toHaveLength(5);
    expect(publishedEvents()).toHaveLength(0);
    expect(upcomingEvents('2026-10-19')).toHaveLength(0);
    expect(pastEvents('2026-10-19')).toHaveLength(0);
    expect(featuredEvents('2026-10-19')).toHaveLength(0);
    expect(getEvent('summer-elite-camp-2026')).toBeUndefined();
  });

  it('does not let comingSoon override an ended or closed date', () => {
    const historic = events[0];
    expect(historic.comingSoon).toBe(true);
    expect(isEventEnded(historic, '2026-10-19')).toBe(true);
    expect(canRegister(historic, '2026-10-19')).toBe(false);
  });

  it('requires verified publication, open status, capacity and valid dates for registration', () => {
    const e = {
      verified: true, status: 'open', remaining: 5, comingSoon: false,
      startDate: '2026-12-20', endDate: '2026-12-20',
      registrationDeadline: '2026-12-19',
    };
    expect(canRegister(e, '2026-10-19')).toBe(true);
    expect(canRegister({ ...e, verified: false }, '2026-10-19')).toBe(false);
    expect(canRegister({ ...e, remaining: 0 }, '2026-10-19')).toBe(false);
    expect(canRegister({ ...e, comingSoon: true }, '2026-10-19')).toBe(false);
    expect(canRegister({ ...e, status: 'closed' }, '2026-10-19')).toBe(false);
    expect(canRegister(e, '2026-12-21')).toBe(false);
  });
});
