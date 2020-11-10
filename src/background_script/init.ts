import { browser } from 'webextension-polyfill-ts';

import { createContextMenus } from './menus';
import { openTreetop, openWelcome } from './open';
import { setDefaultOptions } from './options';

/**
 * Initialize Treetop.
 */
export const init = async (): Promise<void> => {
  // TODO
  browser.runtime.onInstalled.addListener(openWelcome);

  // Install handler to open Treetop when the browser action is clicked
  browser.browserAction.onClicked.addListener(openTreetop);

  // Set default options
  await setDefaultOptions();

  // Create context menus
  createContextMenus();
};
