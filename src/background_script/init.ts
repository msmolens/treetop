import browser from 'webextension-polyfill';

import { createContextMenus } from './menus';
import { openTreetop } from './open-treetop';
import { openWelcome } from './open-welcome';
import { setDefaultOptions } from './options';

/**
 * Initialize Treetop.
 */
export const init = async (): Promise<void> => {
  // Install handler to open the welcome page when the extension is installed
  browser.runtime.onInstalled.addListener(openWelcome);

  // Install handler to open Treetop when the browser action is clicked
  browser.browserAction.onClicked.addListener(openTreetop);

  // Set default options
  const options = {
    showBookmarksToolbar: true,
    showBookmarksMenu: true,
    showOtherBookmarks: true,
    truncate: true,
    tooltips: true,
    showRecentlyVisited: true,
    colorScheme: 'light',
  };

  await setDefaultOptions(options);

  // Create context menus
  createContextMenus();
};
