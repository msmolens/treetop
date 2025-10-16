import { SvelteDate, SvelteMap } from 'svelte/reactivity';
import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/svelte';
import escapeRegExp from 'lodash-es/escapeRegExp';
import { beforeEach, describe, expect, it } from 'vitest';

import type * as Treetop from '@Treetop/treetop/types';

import BookmarkWrapper from '../../test/utils/BookmarkWrapper.svelte';

let lastVisitTimeMap: Treetop.LastVisitTimeMap;
let currentTruncate: boolean;
const truncate = () => currentTruncate;
let currentTooltips: boolean;
const tooltips = () => currentTooltips;
let clock: SvelteDate;
let nodeId: string;
let title: string;
let url: string;

// Maximum allowed length of titles and URLs before being truncated, sometimes
const maxLength = 78;

// Number of milliseconds in an hour
const MILLISECONDS_PER_HOUR =
  1000 * // ms per second
  60 * // seconds per minute
  60; // minutes per hour

const setup = () => {
  render(BookmarkWrapper, {
    lastVisitTimeMap,
    truncate,
    tooltips,
    clock,
    nodeId,
    title,
    url,
  });
};

beforeEach(() => {
  nodeId = faker.string.uuid();
  title = faker.word.words();
  url = faker.internet.url();

  lastVisitTimeMap = new SvelteMap();
  lastVisitTimeMap.set(nodeId, 0);

  currentTruncate = false;
  currentTooltips = false;

  clock = new SvelteDate();
});

it('renders link with expected attributes', () => {
  setup();

  const link = screen.getByRole('link');
  expect(link).toHaveTextContent(title);
  expect(link).toHaveAttribute('href', url);
  expect(link).toHaveAttribute('data-node-id', nodeId);
  expect(link).not.toHaveAttribute('title');
  expect(link).not.toHaveClass(
    'visitedPastDay',
    'visitedPastTwoDays',
    'visitedPastThreeDays',
    'visitedPastWeek',
  );
});

it('uses URL as content when title is empty', () => {
  title = '';

  setup();

  const link = screen.getByRole('link');
  expect(link).toHaveTextContent(url);
});

describe('truncate option', () => {
  beforeEach(() => {
    currentTruncate = true;
  });

  it('truncates long title', () => {
    title = faker.string.alphanumeric(maxLength + 1);
    expect(title.length).toBeGreaterThan(maxLength);

    setup();

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(
      new RegExp(`^${title.substring(0, title.length - 4)}.{3}$`),
    );
  });

  it('truncates long title at a space when possible', () => {
    title = faker.word.words(15);
    expect(title.length).toBeGreaterThan(maxLength);

    setup();

    const link = screen.getByRole('link');
    const titleStart = title.substring(0, Math.floor(maxLength / 2));
    expect(link).toHaveTextContent(
      new RegExp(`^${escapeRegExp(titleStart)}.+\\S\\.{3}$`),
    );
  });

  it('truncates URL when title is empty', () => {
    title = '';
    url += `/${faker.string.alphanumeric(maxLength)}`;
    expect(url.length).toBeGreaterThan(maxLength);

    setup();

    const link = screen.getByRole('link');
    const urlStart = url.substring(0, Math.floor(maxLength / 2));
    expect(link).toHaveTextContent(new RegExp(`^${urlStart}.+\\S.{3}$`));
  });

  it("doesn't truncate short title", () => {
    title = faker.string.alphanumeric(Math.floor(maxLength / 2));

    setup();

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(title);
  });
});

describe('tooltips option', () => {
  beforeEach(() => {
    currentTooltips = true;
  });

  it('title attribute contains title and URL', () => {
    setup();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'title',
      expect.stringMatching(`^${title}\n${url}$`),
    );
  });

  it('long URL is truncated in the middle', () => {
    url += `/${faker.string.alphanumeric(maxLength)}`;

    setup();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'title',
      expect.stringMatching(
        `^${title}\n${url.substring(0, 20)}.+\\.{3}.+${url.substring(
          url.length - 10,
        )}$`,
      ),
    );
  });
});

describe('sets class based on last visit time', () => {
  it.each([
    { deltaHours: 0, className: 'visitedPastDay' },
    { deltaHours: 1, className: 'visitedPastDay' },
    { deltaHours: 4, className: 'visitedPastDay' },
    { deltaHours: 12, className: 'visitedPastDay' },
    { deltaHours: 20, className: 'visitedPastDay' },
    { deltaHours: 24 - 0.001, className: 'visitedPastDay' },
    { deltaHours: 24 + 0.001, className: 'visitedPastTwoDays' },
    { deltaHours: 24 + 1, className: 'visitedPastTwoDays' },
    { deltaHours: 2 * 24 - 0.001, className: 'visitedPastTwoDays' },
    { deltaHours: 2 * 24 + 0.001, className: 'visitedPastThreeDays' },
    { deltaHours: 3 * 24 - 0.001, className: 'visitedPastThreeDays' },
    { deltaHours: 3 * 24 + 0.001, className: 'visitedPastWeek' },
    { deltaHours: 4 * 24, className: 'visitedPastWeek' },
    { deltaHours: 5 * 24, className: 'visitedPastWeek' },
    { deltaHours: 6 * 24, className: 'visitedPastWeek' },
    { deltaHours: 7 * 24 - 0.001, className: 'visitedPastWeek' },
  ])(
    'visited $deltaHours hours ago -> $className',
    ({ deltaHours, className }) => {
      const deltaMs = deltaHours * MILLISECONDS_PER_HOUR;
      const lastVisitTime = Date.now() - deltaMs;
      lastVisitTimeMap.set(nodeId, lastVisitTime);

      setup();

      const link = screen.getByRole('link');
      expect(link).toHaveClass(className);
    },
  );

  it.each`
    deltaHours
    ${7 * 24 + 0.001}
    ${8 * 24}
  `('visited $deltaHours ago -> no class', ({ deltaHours }) => {
    const deltaMs = deltaHours * MILLISECONDS_PER_HOUR;
    const lastVisitTime = Date.now() - deltaMs;
    lastVisitTimeMap.set(nodeId, lastVisitTime);

    setup();

    const link = screen.getByRole('link');
    expect(link).not.toHaveClass(
      'visitedPastDay',
      'visitedPastTwoDays',
      'visitedPastThreeDays',
      'visitedPastWeek',
    );
  });
});
