import type { Unsubscriber } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clock,
  CLOCK_UPDATE_RATE_MS,
  TIMER_UPDATE_RATE_MS,
} from '@Treetop/treetop/clock';

describe('clock', () => {
  let clockValue: Date;
  let unsubscribe: Unsubscriber;

  beforeEach(() => {
    vi.useFakeTimers();

    unsubscribe = clock.subscribe((value: Date) => {
      clockValue = value;
    });
  });

  afterEach(() => {
    unsubscribe();

    vi.useRealTimers();
  });

  it('initializes with current time', () => {
    const now = new Date();
    expect(now.getTime()).toBeGreaterThanOrEqual(clockValue.getTime());
  });

  it('skips update if not enough wall-clock time has elapsed', () => {
    const startTime = clockValue;

    // Repeatedly run the clock timer and check that the store value doesn't
    // update
    for (let i = 0; i < 10; i++) {
      vi.setSystemTime(+startTime + i * TIMER_UPDATE_RATE_MS);
      vi.advanceTimersByTime(TIMER_UPDATE_RATE_MS);

      expect(clockValue).toBe(startTime);
    }
  });

  it('updates if enough wall-clock time has elapsed', () => {
    // Mock the system time so the clock store updates its value
    const now = +clockValue + CLOCK_UPDATE_RATE_MS;
    vi.setSystemTime(now);

    // Run the clock timer and check that the store value updates
    vi.advanceTimersByTime(TIMER_UPDATE_RATE_MS);
    expect(clockValue.getTime()).toBe(now + TIMER_UPDATE_RATE_MS);
  });
});
