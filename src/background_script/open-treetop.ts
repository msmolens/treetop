/**
 * Open Treetop in the current tab.
 */

import type { ChromeEventCallback } from '@Treetop/treetop/types';

export const openTreetop: ChromeEventCallback<
  typeof chrome.action.onClicked
> = () => {
  const url = chrome.runtime.getURL('treetop.html');

  void chrome.tabs.update({ url });
};
