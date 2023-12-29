import get from 'lodash-es/get';

import type * as Treetop from '@Treetop/treetop/types';

/**
 * Set default options, leaving existing options unchanged.
 */
export const setDefaultOptions = async (
  defaultOptions: Record<string, Treetop.PreferenceValue>,
): Promise<void> => {
  try {
    // Get stored options
    const storedOptions = await chrome.storage.local.get();

    // Remove values that are no longer supported from stored options
    if (get(storedOptions, 'colorScheme') === 'system') {
      delete storedOptions.colorScheme;
    }

    // Merge stored options into default options
    const updatedOptions = {
      ...defaultOptions,
      ...storedOptions,
    };

    // Update stored options
    await chrome.storage.local.set(updatedOptions);
  } catch (err) {
    console.error('Error setting default options:', err);
    throw err;
  }
};
