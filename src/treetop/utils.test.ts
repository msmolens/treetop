import { describe, expect, it } from 'vitest';

import { truncateMiddle } from '@Treetop/treetop/utils';

describe('truncateMiddle', () => {
  it.each([
    ['', 1],
    ['', 5],
    ['a', 1],
    ['a', 5],
    ['ab', 2],
    ['ab', 5],
    ['abc', 5],
    ['abc', 10],
    ['abcd', 5],
    ['abcd', 10],
    ['abcde', 5],
    ['abcde', 10],
  ])(
    'returns unmodified string if length is less than or equal to max. length: %p/%i',
    (str, maxLength) => {
      expect(truncateMiddle(str, maxLength)).toBe(str);
    },
  );

  it.each([
    { str: '0123456789', maxLength: 6, expected: '012...89' },
    { str: '0123456789', maxLength: 7, expected: '0123...89' },
    { str: '0123456789', maxLength: 8, expected: '0123...789' },
    { str: '0123456789', maxLength: 9, expected: '01234...789' },
  ])(
    'returns $expected for $str with max. length $maxLength',
    ({ str, maxLength, expected }) => {
      expect(truncateMiddle(str, maxLength)).toBe(expected);
    },
  );
});
