import { faker } from '@faker-js/faker';
import EventEmitter from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PreferencesManager } from '@Treetop/treetop/PreferencesManager';
import type * as Treetop from '@Treetop/treetop/types';

let preferencesManager: PreferencesManager;

describe('constructor', () => {
  it('registers storage event handler', () => {
    const addListener = vi.fn();
    vi.spyOn(chrome.storage.onChanged, 'addListener').mockImplementation(
      addListener,
    );

    preferencesManager = new PreferencesManager();

    expect(addListener).toHaveBeenCalledOnce();
  });
});

describe('createPreference', () => {
  beforeEach(() => {
    const addListener = vi.fn();
    vi.spyOn(chrome.storage.onChanged, 'addListener').mockImplementation(
      addListener,
    );

    preferencesManager = new PreferencesManager();
  });

  it.each(['value', 2, false, true, ['value'], [2], [false], [true]])(
    'creates and returns a preference for value: %p',
    (value: Treetop.PreferenceValue) => {
      const name = faker.word.sample();
      const preference = preferencesManager.createPreference(name, value);

      expect(preference()).toBe(value);
    },
  );
});

describe('loadPreferences', () => {
  let stringPreference: () => Treetop.PreferenceValue;
  let numberPreference: () => Treetop.PreferenceValue;
  let booleanPreference: () => Treetop.PreferenceValue;
  let stringArrayPreference: () => Treetop.PreferenceValue;
  let numberArrayPreference: () => Treetop.PreferenceValue;
  let booleanArrayPreference: () => Treetop.PreferenceValue;

  beforeEach(() => {
    const addListener = vi.fn();
    vi.spyOn(chrome.storage.onChanged, 'addListener').mockImplementation(
      addListener,
    );

    preferencesManager = new PreferencesManager();
    stringPreference = preferencesManager.createPreference('string', 'value');
    numberPreference = preferencesManager.createPreference('number', 2);
    booleanPreference = preferencesManager.createPreference('boolean', true);
    stringArrayPreference = preferencesManager.createPreference(
      'string_array',
      ['value'],
    );
    numberArrayPreference = preferencesManager.createPreference(
      'number_array',
      [2],
    );
    booleanArrayPreference = preferencesManager.createPreference(
      'boolean_array',
      [true],
    );
  });

  it('loads preferences from storage and initializes preference state', async () => {
    const values = {
      string: 'value2',
      number: 3,
      boolean: false,
      string_array: ['value2'],
      number_array: [3],
      boolean_array: [false],
    };

    vi.spyOn(chrome.storage.local, 'get').mockImplementation(
      vi.fn().mockResolvedValue(values),
    );

    await preferencesManager.loadPreferences();

    expect(stringPreference()).toBe('value2');
    expect(numberPreference()).toBe(3);
    expect(booleanPreference()).toBe(false);
    expect(stringArrayPreference()).toStrictEqual(['value2']);
    expect(numberArrayPreference()).toStrictEqual([3]);
    expect(booleanArrayPreference()).toStrictEqual([false]);
  });

  it('ignores preferences from storage without a corresponding preference', async () => {
    const values = { other: true };

    vi.spyOn(chrome.storage.local, 'get').mockImplementation(
      vi.fn().mockResolvedValue(values),
    );

    await preferencesManager.loadPreferences();
  });
});

describe('handleStorageChanged', () => {
  let emitter: EventEmitter;
  let stringPreference: () => Treetop.PreferenceValue;
  let numberPreference: () => Treetop.PreferenceValue;
  let booleanPreference: () => Treetop.PreferenceValue;
  let stringArrayPreference: () => Treetop.PreferenceValue;
  let numberArrayPreference: () => Treetop.PreferenceValue;
  let booleanArrayPreference: () => Treetop.PreferenceValue;

  beforeEach(() => {
    emitter = new EventEmitter();
    vi.spyOn(chrome.storage.onChanged, 'addListener').mockImplementation(
      (listener) => {
        emitter.addListener('onChanged', listener);
      },
    );

    preferencesManager = new PreferencesManager();
    stringPreference = preferencesManager.createPreference('string', 'value');
    numberPreference = preferencesManager.createPreference('number', 3);
    booleanPreference = preferencesManager.createPreference('boolean', true);
    stringArrayPreference = preferencesManager.createPreference(
      'string_array',
      ['value'],
    );
    numberArrayPreference = preferencesManager.createPreference(
      'number_array',
      [2],
    );
    booleanArrayPreference = preferencesManager.createPreference(
      'boolean_array',
      [true],
    );
  });

  it('updates preferences when storage values change', () => {
    const changes = {
      string: {
        newValue: 'value2',
      },
      number: {
        newValue: 4,
      },
      boolean: {
        newValue: false,
      },
      string_array: {
        newValue: ['value2'],
      },
      number_array: {
        newValue: [3],
      },
      boolean_array: {
        newValue: [false],
      },
    };

    emitter.emit('onChanged', changes, 'local');

    expect(stringPreference()).toBe('value2');
    expect(numberPreference()).toBe(4);
    expect(booleanPreference()).toBe(false);
    expect(stringArrayPreference()).toStrictEqual(['value2']);
    expect(numberArrayPreference()).toStrictEqual([3]);
    expect(booleanArrayPreference()).toStrictEqual([false]);
  });

  it('ignores storage changes without a corresponding preference', () => {
    const changes = { other: { newValue: true } };

    emitter.emit('onChanged', changes, 'local');
  });
});
