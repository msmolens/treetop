import type { SvelteDate } from 'svelte/reactivity';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CLOCK_UPDATE_RATE_MS,
  createClock,
} from '@Treetop/treetop/clock.svelte';

describe('clock', () => {
  let clock: SvelteDate;
  let cleanupEffect: () => void;

  beforeEach(() => {
    vi.useFakeTimers();

    cleanupEffect = $effect.root(() => {
      clock = createClock();
    });
  });

  afterEach(() => {
    cleanupEffect();

    vi.useRealTimers();
  });

  it('initializes with current time', () => {
    const now = new Date();
    expect(now.getTime()).toBe(clock.getTime());
  });

  it('skips update if not enough wall-clock time has elapsed', () => {
    const startTime = clock.getTime();

    const iterations = 10;
    const interval = CLOCK_UPDATE_RATE_MS / iterations;

    // Repeatedly run the clock timer and check that the store value doesn't
    // update
    for (let i = 0; i < iterations - 1; i++) {
      vi.setSystemTime(startTime + i * interval);
      vi.advanceTimersByTime(interval);

      expect(clock.getTime()).toBe(startTime);
    }
  });

  it('updates if enough wall-clock time has elapsed', () => {
    // Mock the system time so the clock updates its value
    const now = clock.getTime() + CLOCK_UPDATE_RATE_MS;
    vi.setSystemTime(now);

    // Run the clock timer and check that the clock value updates
    vi.advanceTimersByTime(CLOCK_UPDATE_RATE_MS);
    expect(clock.getTime()).toBe(now + CLOCK_UPDATE_RATE_MS);
  });
});
