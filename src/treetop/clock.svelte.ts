import { SvelteDate } from 'svelte/reactivity';

// Rate at which to update the clock
const CLOCK_UPDATE_RATE_MINUTES = 60;
export const CLOCK_UPDATE_RATE_MS = CLOCK_UPDATE_RATE_MINUTES * 60 * 1000;

/**
 * Clock that provides the current time. Its value updates only once per hour.
 */
export function createClock() {
  // Note: For compatibility with fake timers in tests, explicitly initialize
  // the clock to the current time
  const clock = new SvelteDate(Date.now());

  $effect(() => {
    const interval = setInterval(() => {
      clock.setTime(Date.now());
    }, CLOCK_UPDATE_RATE_MS);

    return () => {
      clearInterval(interval);
    };
  });

  return clock;
}
