import { MILLISECONDS_PER_HOUR } from '@Treetop/treetop/clock';
import type * as Treetop from '@Treetop/treetop/types';

jest.useFakeTimers();

describe('clock', () => {
  let clockValue: Date;
  let unsubscribe: Treetop.SvelteStoreUnsubscriber;

  beforeEach(() => {
    // eslint-disable-next-line
    const { clock } = require('../../src/treetop/clock');
    // eslint-disable-next-line
    unsubscribe = clock.subscribe((value: Date) => {
      clockValue = value;
    });
  });

  afterEach(() => {
    unsubscribe();
  });

  it('initializes with current time', () => {
    const now = new Date();
    expect(now.getTime()).toBeGreaterThanOrEqual(clockValue.getTime());
  });

  it('updates every hour', () => {
    const clockTime1 = clockValue;
    jest.advanceTimersByTime(MILLISECONDS_PER_HOUR - 1000);
    const clockTime2 = clockValue;
    expect(clockTime2).toBe(clockTime1);

    jest.advanceTimersByTime(1000);
    const clockTime3 = clockValue;
    expect(clockTime3.getTime()).toBeGreaterThan(clockTime2.getTime());
  });
});
