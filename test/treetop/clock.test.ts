import {
  CLOCK_UPDATE_RATE_MS,
  TIMER_UPDATE_RATE_MS,
} from '@Treetop/treetop/clock';
import type * as Treetop from '@Treetop/treetop/types';

describe('clock', () => {
  let clockValue: Date;
  let unsubscribe: Treetop.SvelteStoreUnsubscriber;

  beforeEach(() => {
    jest.useFakeTimers('modern');

    // eslint-disable-next-line
    const { clock } = require('../../src/treetop/clock');
    // eslint-disable-next-line
    unsubscribe = clock.subscribe((value: Date) => {
      clockValue = value;
    });
  });

  afterEach(() => {
    unsubscribe();

    jest.useRealTimers();
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
      jest.setSystemTime(+startTime + i * TIMER_UPDATE_RATE_MS);
      jest.advanceTimersByTime(TIMER_UPDATE_RATE_MS);

      expect(clockValue).toBe(startTime);
    }
  });

  it('updates if enough wall-clock time has elapsed', () => {
    // Mock the system time so the clock store updates its value
    const now = +clockValue + CLOCK_UPDATE_RATE_MS;
    jest.setSystemTime(now);

    // Run the clock timer and check that the store value updates
    jest.advanceTimersByTime(TIMER_UPDATE_RATE_MS);
    expect(clockValue.getTime()).toBe(now + TIMER_UPDATE_RATE_MS);
  });
});
