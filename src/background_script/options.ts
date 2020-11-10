import { browser } from 'webextension-polyfill-ts';

/**
 * Set default options.
 */
export const setDefaultOptions = async (): Promise<void> => {
  const defaultOptions = {
    showBookmarksToolbar: true,
    showBookmarksMenu: true,
    showOtherBookmarks: true,
    truncate: true,
    tooltips: true,
    showRecentlyVisited: true,
  };

  try {
    await browser.storage.local.set(defaultOptions);
  } catch (err) {
    console.error('Error setting default options:', err);
  }
};
