import { readable } from 'svelte/store';

// Number of milliseconds in an hour
export const MILLISECONDS_PER_HOUR =
  1000 * // ms per second
  60 * // seconds per minute
  60; // minutes per hour

/**
 * Readable store that provides the current time. The value updates only once
 * per hour.
 */
export const clock = readable(new Date(), (set) => {
  const interval = setInterval(() => {
    set(new Date());
  }, MILLISECONDS_PER_HOUR);

  return () => {
    clearInterval(interval);
  };
});
