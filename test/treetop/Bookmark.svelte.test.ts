import { Writable, writable } from 'svelte/store';
import { render, screen } from '@testing-library/svelte';
import faker from 'faker';

import Bookmark from '@Treetop/treetop/Bookmark.svelte';
import type * as Treetop from '@Treetop/treetop/types';

import ContextWrapper from '../utils/ContextWrapper.svelte';

let lastVisitTimeMap: Treetop.LastVisitTimeMap;
let truncate: Writable<boolean>;
let tooltips: Writable<boolean>;
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
  render(ContextWrapper, {
    Component: Bookmark,
    Props: { nodeId, title, url },
    Context: {
      lastVisitTimeMap,
      truncate,
      tooltips,
    },
  });
};

beforeEach(() => {
  nodeId = faker.random.uuid();
  title = faker.random.words();
  url = faker.internet.url();

  lastVisitTimeMap = new Map() as Treetop.LastVisitTimeMap;
  lastVisitTimeMap.set(nodeId, writable(0));

  truncate = writable(false);
  tooltips = writable(false);
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
    'visitedPastWeek'
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
    truncate.set(true);
  });

  it('truncates long title', () => {
    title = faker.random.alphaNumeric(maxLength + 1);
    expect(title.length).toBeGreaterThan(maxLength);

    setup();

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(
      new RegExp(`^${title.substring(0, title.length - 4)}.{3}$`)
    );
  });

  it('truncates long title at a space when possible', () => {
    title = faker.random.words(15);
    expect(title.length).toBeGreaterThan(maxLength);

    setup();

    const link = screen.getByRole('link');
    const titleStart = title.substring(0, Math.floor(maxLength / 2));
    expect(link).toHaveTextContent(new RegExp(`^${titleStart}.+\\S\\.{3}$`));
  });

  it('truncates URL when title is empty', () => {
    title = '';
    url += `/${faker.random.alphaNumeric(maxLength)}`;
    expect(url.length).toBeGreaterThan(maxLength);

    setup();

    const link = screen.getByRole('link');
    const urlStart = url.substring(0, Math.floor(maxLength / 2));
    expect(link).toHaveTextContent(new RegExp(`^${urlStart}.+\\S.{3}$`));
  });

  it("doesn't truncate short title", () => {
    title = faker.random.alphaNumeric(Math.floor(maxLength / 2));

    setup();

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(title);
  });
});

describe('tooltips option', () => {
  beforeEach(() => {
    tooltips.set(true);
  });

  it('title attribute contains title and URL', () => {
    setup();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'title',
      expect.stringMatching(`^${title}\n${url}$`)
    );
  });

  it('long URL is truncated in the middle', () => {
    url += `/${faker.random.alphaNumeric(maxLength)}`;

    setup();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'title',
      expect.stringMatching(
        `^${title}\n${url.substring(0, 20)}.+\\.{3}.+${url.substring(
          url.length - 10
        )}$`
      )
    );
  });
});

describe('sets class based on last visit time', () => {
  it.each`
    deltaHours        | className
    ${0}              | ${'visitedPastDay'}
    ${1}              | ${'visitedPastDay'}
    ${4}              | ${'visitedPastDay'}
    ${12}             | ${'visitedPastDay'}
    ${20}             | ${'visitedPastDay'}
    ${24 - 0.001}     | ${'visitedPastDay'}
    ${24 + 0.001}     | ${'visitedPastTwoDays'}
    ${24 + 1}         | ${'visitedPastTwoDays'}
    ${2 * 24 - 0.001} | ${'visitedPastTwoDays'}
    ${2 * 24 + 0.001} | ${'visitedPastThreeDays'}
    ${3 * 24 - 0.001} | ${'visitedPastThreeDays'}
    ${3 * 24 + 0.001} | ${'visitedPastWeek'}
    ${4 * 24}         | ${'visitedPastWeek'}
    ${5 * 24}         | ${'visitedPastWeek'}
    ${6 * 24}         | ${'visitedPastWeek'}
    ${7 * 24 - 0.001} | ${'visitedPastWeek'}
  `(
    'visited $deltaHours hours ago -> $className',
    ({ deltaHours, className }) => {
      const deltaMs = deltaHours * MILLISECONDS_PER_HOUR;
      const lastVisitTime = Date.now() - deltaMs;
      lastVisitTimeMap.get(nodeId)!.set(lastVisitTime);

      setup();

      const link = screen.getByRole('link');
      expect(link).toHaveClass(className);
    }
  );

  it.each`
    deltaHours
    ${7 * 24 + 0.001}
    ${8 * 24}
  `('visited $deltaHours ago -> no class', ({ deltaHours }) => {
    const deltaMs = deltaHours * MILLISECONDS_PER_HOUR;
    const lastVisitTime = Date.now() - deltaMs;
    lastVisitTimeMap.get(nodeId)!.set(lastVisitTime);

    setup();

    const link = screen.getByRole('link');
    expect(link).not.toHaveClass(
      'visitedPastDay',
      'visitedPastTwoDays',
      'visitedPastThreeDays',
      'visitedPastWeek'
    );
  });
});
