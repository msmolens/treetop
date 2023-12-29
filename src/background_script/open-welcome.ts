import type { ChromeEventCallback } from '@Treetop/treetop/types';

/**
 * Open the welcome page when the extension is installed.
 */
export const openWelcome: ChromeEventCallback<
  typeof chrome.runtime.onInstalled
> = ({ reason }) => {
  if (reason !== 'install') {
    return;
  }
  const url = chrome.runtime.getURL('welcome.html');
  void chrome.tabs.create({ url });
};
