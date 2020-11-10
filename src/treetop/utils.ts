/**
 * Shorten a string greater than the specified length by replacing text in the
 * middle with an ellipsis. Assumes maxLength is positive.
 * Based on https://stackoverflow.com/a/831583
 */
export function truncateMiddle(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }

  const midpoint = Math.floor(str.length / 2);
  const toRemove = str.length - maxLength;
  const lstrip = Math.floor(toRemove / 2);
  const rstrip = toRemove - lstrip + 1;
  const left = str.slice(0, midpoint - lstrip);
  const right = str.slice(midpoint + rstrip);
  return `${left}...${right}`;
}
