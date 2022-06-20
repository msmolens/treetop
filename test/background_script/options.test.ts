import { setDefaultOptions } from '@Treetop/background_script/options';
import type * as Treetop from '@Treetop/treetop/types';

let defaultOptions: Record<string, Treetop.PreferenceValue>;

beforeEach(() => {
  defaultOptions = {
    a: true,
    b: false,
    c: 0,
    d: 1,
    e: 'test1',
    f: 'test2',
    g: [false, true],
    h: [1, 2],
    i: ['test1', 'test2'],
  };
});

it('sets default options when no options are stored', async () => {
  const storedOptions = {};
  const updatedOptions = {
    ...defaultOptions,
  };

  mockBrowser.storage.local.get.expect.andResolve(storedOptions);
  mockBrowser.storage.local.set.expect(updatedOptions);

  await setDefaultOptions(defaultOptions);
});

it('leaves existing options unchanged', async () => {
  const storedOptions = {
    a: false,
    b: true,
    c: 2,
    d: 3,
    e: 'test3',
    f: 'test4',
    g: [true, false, false],
    h: [3, 0, 1],
    i: ['test3', 'test4'],
  };

  const updatedOptions = {
    ...storedOptions,
  };

  mockBrowser.storage.local.get.expect.andResolve(storedOptions);
  mockBrowser.storage.local.set.expect(updatedOptions);

  await setDefaultOptions(defaultOptions);
});

it('sets default options and leaves existing options unchanged', async () => {
  const storedOptions = {
    a: false,
    c: 3,
    e: 'test2',
    h: [3, 0],
  };

  const updatedOptions = {
    a: false,
    b: false,
    c: 3,
    d: 1,
    e: 'test2',
    f: 'test2',
    g: [false, true],
    h: [3, 0],
    i: ['test1', 'test2'],
  };

  mockBrowser.storage.local.get.expect.andResolve(storedOptions);
  mockBrowser.storage.local.set.expect(updatedOptions);

  await setDefaultOptions(defaultOptions);
});

describe('colorScheme option', () => {
  beforeEach(() => {
    defaultOptions = {
      colorScheme: 'light',
    };
  });

  it("overwrites legacy 'system' colorScheme option", async () => {
    const storedOptions = {
      colorScheme: 'system',
    };

    const updatedOptions = {
      ...defaultOptions,
    };

    mockBrowser.storage.local.get.expect.andResolve(storedOptions);
    mockBrowser.storage.local.set.expect(updatedOptions);

    await setDefaultOptions(defaultOptions);
  });

  it("doesn't overwrite non-legacy colorScheme option", async () => {
    const storedOptions = {
      colorScheme: 'dark',
    };

    const updatedOptions = {
      ...storedOptions,
    };

    mockBrowser.storage.local.get.expect.andResolve(storedOptions);
    mockBrowser.storage.local.set.expect(updatedOptions);

    await setDefaultOptions(defaultOptions);
  });
});
