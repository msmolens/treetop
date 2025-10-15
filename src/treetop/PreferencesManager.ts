import { SvelteMap } from 'svelte/reactivity';

import type * as Treetop from './types';

type StorageChangedCallback = Parameters<
  typeof chrome.storage.onChanged.addListener
>[0];

/**
 * Class to create and manage updating preferences.
 */
export class PreferencesManager {
  private readonly preferences = new SvelteMap<
    string,
    Treetop.PreferenceValue
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
   * Create and register a preference.
   */
  createPreference(
    name: string,
    value: Treetop.PreferenceValue,
  ): () => Treetop.PreferenceValue {
    this.preferences.set(name, value);

    return () => this.preferences.get(name)!;
  }

  /**
   * Load preferences from storage and initialize preference state.
   */
  async loadPreferences(): Promise<void> {
    // Get preferences from storage
    const results = await chrome.storage.local.get();

    // Initialize preference state
    for (const key of Object.keys(results)) {
      const value = results[key] as Treetop.PreferenceValue;

      if (this.preferences.has(key)) {
        this.preferences.set(key, value);
      }
    }
  }

  /**
   * Update preference state when storage values change.
   */
  private handleStorageChanged(
    changes: Record<string, chrome.storage.StorageChange>,
    _areaName: string,
  ): void {
    for (const key of Object.keys(changes)) {
      const value = changes[key].newValue as Treetop.PreferenceValue;

      if (this.preferences.has(key)) {
        this.preferences.set(key, value);
      }
    }
  }
}
