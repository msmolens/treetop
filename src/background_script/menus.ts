import browser, { Menus } from 'webextension-polyfill';

/**
 * Create context menus.
 */
export const createContextMenus = (): void => {
  // Get match pattern for the extension's origin
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions#Host_permissions
  const origin = browser.runtime.getURL('');

  const commonMenuParams: {
    contexts: Menus.ContextType[];
    documentUrlPatterns: string[];
  } = {
    contexts: ['link'],
    documentUrlPatterns: [`${origin}*`],
  };

  browser.menus.create({
    id: 'openAllInTabs',
    title: browser.i18n.getMessage('menuItemOpenAllInTabs'),
    ...commonMenuParams,
  });

  browser.menus.create({
    id: 'separator1',
    type: 'separator',
    ...commonMenuParams,
  });

  browser.menus.create({
    id: 'delete',
    title: browser.i18n.getMessage('menuItemDelete'),
    ...commonMenuParams,
  });

  browser.menus.create({
    id: 'separator2',
    type: 'separator',
    ...commonMenuParams,
  });

  browser.menus.create({
    id: 'properties',
    title: browser.i18n.getMessage('menuItemProperties'),
    ...commonMenuParams,
  });
};
