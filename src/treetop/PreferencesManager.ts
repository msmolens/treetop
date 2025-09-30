import { type Writable, writable } from 'svelte/store';

import type * as Treetop from './types';

type StorageChangedCallback = Parameters<
  typeof chrome.storage.onChanged.addListener
>[0];

/**
 * Class to create and manage updating preference stores.
 */
export class PreferencesManager {
  private readonly stores = new Map<
    string,
    Writable<Treetop.PreferenceValue>
  >();

  // Bound event handler
  private readonly onChanged: StorageChangedCallback = (changes, areaName) => {
    this.handleStorageChanged(changes, areaName);
  };

  constructor() {
    // Register storage event handler
    chrome.storage.onChanged.addListener(this.onChanged);
  }

  /**
   * Create and register a store.
   */
  createStore(
    name: string,
    value: Treetop.PreferenceValue,
  ): Writable<Treetop.PreferenceValue> {
    const store = writable(value);
    this.stores.set(name, store);
    return store;
  }

  /**
   * Load preferences from storage and initialize stores.
   */
  async loadPreferences(): Promise<void> {
    // Get preferences from storage
    const results = await chrome.storage.local.get();

    // Initialize stores
    for (const key of Object.keys(results)) {
      const value = results[key] as Treetop.PreferenceValue;

      const store = this.stores.get(key);
      if (store !== undefined) {
        store.set(value);
      }
    }
  }

  /**
   * Update preferences stores when storage values change.
   */
  private handleStorageChanged(
    changes: Record<string, chrome.storage.StorageChange>,
    _areaName: string,
  ): void {
    for (const key of Object.keys(changes)) {
      const value = changes[key].newValue as Treetop.PreferenceValue;

      const store = this.stores.get(key);
      if (store !== undefined) {
        store.set(value);
      }
    }
  }
}
