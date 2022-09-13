import browser, { type Runtime } from 'webextension-polyfill';

/**
 * Open the welcome page when the extension is installed.
 */
export const openWelcome = ({
  reason,
  temporary,
}: Runtime.OnInstalledDetailsType): void => {
  if (temporary || reason !== 'install') {
    return;
  }

  const url = browser.runtime.getURL('welcome.html');
  void browser.tabs.create({ url });
};
