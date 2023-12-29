import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  const get = vi.fn().mockResolvedValue(storedOptions);
  vi.spyOn(chrome.storage.local, 'get').mockImplementation(get);

  const set = vi.fn();
  vi.spyOn(chrome.storage.local, 'set').mockImplementation(set);

  await setDefaultOptions(defaultOptions);

  expect(set).toHaveBeenCalledOnce();
  expect(set).toHaveBeenCalledWith(updatedOptions);
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

  const get = vi.fn().mockResolvedValue(storedOptions);
  vi.spyOn(chrome.storage.local, 'get').mockImplementation(get);

  const set = vi.fn();
  vi.spyOn(chrome.storage.local, 'set').mockImplementation(set);

  await setDefaultOptions(defaultOptions);

  expect(set).toHaveBeenCalledOnce();
  expect(set).toHaveBeenCalledWith(updatedOptions);
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

  const get = vi.fn().mockResolvedValue(storedOptions);
  vi.spyOn(chrome.storage.local, 'get').mockImplementation(get);

  const set = vi.fn();
  vi.spyOn(chrome.storage.local, 'set').mockImplementation(set);

  await setDefaultOptions(defaultOptions);

  expect(set).toHaveBeenCalledOnce();
  expect(set).toHaveBeenCalledWith(updatedOptions);
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

    const get = vi.fn().mockResolvedValue(storedOptions);
    vi.spyOn(chrome.storage.local, 'get').mockImplementation(get);

    const set = vi.fn();
    vi.spyOn(chrome.storage.local, 'set').mockImplementation(set);

    await setDefaultOptions(defaultOptions);

    expect(set).toHaveBeenCalledOnce();
    expect(set).toHaveBeenCalledWith(updatedOptions);
  });

  it("doesn't overwrite non-legacy colorScheme option", async () => {
    const storedOptions = {
      colorScheme: 'dark',
    };

    const updatedOptions = {
      ...storedOptions,
    };

    const get = vi.fn().mockResolvedValue(storedOptions);
    vi.spyOn(chrome.storage.local, 'get').mockImplementation(get);

    const set = vi.fn();
    vi.spyOn(chrome.storage.local, 'set').mockImplementation(set);

    await setDefaultOptions(defaultOptions);

    expect(set).toHaveBeenCalledOnce();
    expect(set).toHaveBeenCalledWith(updatedOptions);
  });
});
