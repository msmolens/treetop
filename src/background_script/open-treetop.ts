/**
 * Open Treetop in the current tab.
 */

import type { ChromeEventCallback } from '@Treetop/treetop/types';

const asyncOpenTreetop = async (): Promise<void> => {
  const url = chrome.runtime.getURL('treetop.html');

  const { openInNewTab } = await chrome.storage.local.get('openInNewTab');

  if (openInNewTab) {
    await chrome.tabs.create({ url });
  } else {
    await chrome.tabs.update({ url });
  }
};

export const openTreetop: ChromeEventCallback<
  typeof chrome.action.onClicked
> = () => {
  asyncOpenTreetop().catch((err) => {
    console.error(err);
  });
};
