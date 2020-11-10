import { browser } from 'webextension-polyfill-ts';

/**
 * Open the welcome page when the extension is installed.
 */
export const openWelcome = ({
  reason,
  temporary,
}: browser.runtime._OnInstalledDetails): void => {
  if (temporary || reason !== 'install') {
    return;
  }

  const url = browser.runtime.getURL('welcome.html');
  void browser.tabs.create({ url });
};

/**
 * Open Treetop.
 *
 * Keyboard modifiers:
 *   Left click:
 *     None: Open in current tab
 *     Ctrl: Open new tab in background
 *     Ctrl+Shift: Open new tab
 *     Shift: Open new window
 *   Middle click:
 *     None: Open in new tab in background
 *     Shift: Open in new tab
 */
export const openTreetop = (
  _tab: browser.tabs.Tab,
  info: browser.browserAction.OnClickData | undefined
): void => {
  if (!info) {
    return;
  }

  const url = browser.runtime.getURL('treetop.html');
  const params: browser.tabs._CreateCreateProperties = { url };

  const ctrl =
    info.modifiers.includes('Ctrl') || info.modifiers.includes('Command');
  const shift = info.modifiers.includes('Shift');

  if (info.button === 0) {
    // Left click
    if (ctrl) {
      params.active = shift;
      void browser.tabs.create(params);
    } else if (shift) {
      void browser.windows.create(params);
    } else {
      void browser.tabs.update(params);
    }
  } else if (info.button === 1) {
    // Middle click
    params.active = shift;
    void browser.tabs.create(params);
  }
};
