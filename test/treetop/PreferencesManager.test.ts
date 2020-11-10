import { get, Writable } from 'svelte/store';
import faker from 'faker';

import { PreferencesManager } from '@Treetop/treetop/PreferencesManager';
import type * as Treetop from '@Treetop/treetop/types';

let preferencesManager: PreferencesManager;

describe('constructor', () => {
  it('registers storage event handler', () => {
    mockBrowser.storage.onChanged.addListener.expect;

    preferencesManager = new PreferencesManager();
  });
});

describe('createStore', () => {
  beforeEach(() => {
    mockBrowser.storage.onChanged.addListener.expect;
    preferencesManager = new PreferencesManager();
  });

  it.each(['value', 2, false, true, ['value'], [2], [false], [true]])(
    'creates and returns a store for value: %p',
    (value: Treetop.PreferenceValue) => {
      const name = faker.random.word();
      const store = preferencesManager.createStore(name, value);

      expect(get(store)).toBe(value);
    }
  );
});

describe('loadPreferences', () => {
  let stringStore: Writable<Treetop.PreferenceValue>;
  let numberStore: Writable<Treetop.PreferenceValue>;
  let booleanStore: Writable<Treetop.PreferenceValue>;
  let stringArrayStore: Writable<Treetop.PreferenceValue>;
  let numberArrayStore: Writable<Treetop.PreferenceValue>;
  let booleanArrayStore: Writable<Treetop.PreferenceValue>;

  beforeEach(() => {
    mockBrowser.storage.onChanged.addListener.expect;
    preferencesManager = new PreferencesManager();
    stringStore = preferencesManager.createStore('string', 'value');
    numberStore = preferencesManager.createStore('number', 2);
    booleanStore = preferencesManager.createStore('boolean', true);
    stringArrayStore = preferencesManager.createStore('string_array', [
      'value',
    ]);
    numberArrayStore = preferencesManager.createStore('number_array', [2]);
    booleanArrayStore = preferencesManager.createStore('boolean_array', [true]);
  });

  it('loads preferences from storage and initializes stores', async () => {
    const values = {
      string: 'value2',
      number: 3,
      boolean: false,
      string_array: ['value2'],
      number_array: [3],
      boolean_array: [false],
    };
    mockBrowser.storage.local.get.expect.andResolve(values);

    await preferencesManager.loadPreferences();

    expect(get(stringStore)).toBe('value2');
    expect(get(numberStore)).toBe(3);
    expect(get(booleanStore)).toBe(false);
    expect(get(stringArrayStore)).toStrictEqual(['value2']);
    expect(get(numberArrayStore)).toStrictEqual([3]);
    expect(get(booleanArrayStore)).toStrictEqual([false]);
  });

  it('ignores preferences from storage without a corresponding store', async () => {
    const values = { other: true };
    mockBrowser.storage.local.get.expect.andResolve(values);

    await preferencesManager.loadPreferences();
  });
});

describe('handleStoreChanged', () => {
  let stringStore: Writable<Treetop.PreferenceValue>;
  let numberStore: Writable<Treetop.PreferenceValue>;
  let booleanStore: Writable<Treetop.PreferenceValue>;
  let stringArrayStore: Writable<Treetop.PreferenceValue>;
  let numberArrayStore: Writable<Treetop.PreferenceValue>;
  let booleanArrayStore: Writable<Treetop.PreferenceValue>;

  beforeEach(() => {
    mockBrowser.storage.onChanged.addListener.expect;
    preferencesManager = new PreferencesManager();
    stringStore = preferencesManager.createStore('string', 'value');
    numberStore = preferencesManager.createStore('number', 3);
    booleanStore = preferencesManager.createStore('boolean', true);
    stringArrayStore = preferencesManager.createStore('string_array', [
      'value',
    ]);
    numberArrayStore = preferencesManager.createStore('number_array', [2]);
    booleanArrayStore = preferencesManager.createStore('boolean_array', [true]);
  });

  it('updates stores when store values change', () => {
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
    preferencesManager.handleStorageChanged(changes, 'local');

    expect(get(stringStore)).toBe('value2');
    expect(get(numberStore)).toBe(4);
    expect(get(booleanStore)).toBe(false);
    expect(get(stringArrayStore)).toStrictEqual(['value2']);
    expect(get(numberArrayStore)).toStrictEqual([3]);
    expect(get(booleanArrayStore)).toStrictEqual([false]);
  });

  it('ignores store changes without a corresponding store', () => {
    const changes = { other: { newValue: true } };
    preferencesManager.handleStorageChanged(changes, 'local');
  });
});
