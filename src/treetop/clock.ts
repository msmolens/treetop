import { readable } from 'svelte/store';

// Rate at which to update the store value
const CLOCK_UPDATE_RATE_MINUTES = 60;
export const CLOCK_UPDATE_RATE_MS = CLOCK_UPDATE_RATE_MINUTES * 60 * 1000;

// Rate at which to fire the timer to check whether to update the store value
const TIMER_UPDATE_RATE_MINUTES = 1;
export const TIMER_UPDATE_RATE_MS = TIMER_UPDATE_RATE_MINUTES * 60 * 1000;

/**
 * Readable store that provides the current time. The value updates only once
 * per hour.
 */
export const clock = readable(new Date(), (set) => {
  let lastUpdate = new Date();

  // Set up a timer that updates the store value if CLOCK_UPDATE_RATE_MINUTES
  // minutes have passed in wall-clock time since the last update.
  const interval = setInterval(() => {
    const now = new Date();
    // Coerce Date objects to numbers with unary '+' operator to work around the
    // following TypeScript error:
    //
    //     TS2362: The left-hand side of an arithmetic operation must be of type
    //     'any', 'number', 'bigint' or an enum type
    //
    // See https://github.com/Microsoft/TypeScript/issues/5710#issuecomment-157886246
    const elapsedMs = Math.abs(+now - +lastUpdate);
    if (elapsedMs >= CLOCK_UPDATE_RATE_MS) {
      lastUpdate = now;
      set(now);
    }
  }, TIMER_UPDATE_RATE_MS);

  return () => {
    clearInterval(interval);
  };
});
