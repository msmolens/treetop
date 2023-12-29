import type { ChromeEventCallback } from '@Treetop/treetop/types';

type ContextMenuCreateProperties = Parameters<
  typeof chrome.contextMenus.create
>[0];

/**
 * Create context menus.
 */
export const createContextMenus: ChromeEventCallback<
  typeof chrome.runtime.onInstalled
> = () => {
  // Get match pattern for the extension's origin
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions#Host_permissions
  const origin = chrome.runtime.getURL('');

  const commonMenuParams: ContextMenuCreateProperties = {
    contexts: ['link'],
    documentUrlPatterns: [`${origin}*`],
  };

  chrome.contextMenus.create({
    id: 'openAllInTabs',
    title: chrome.i18n.getMessage('menuItemOpenAllInTabs'),
    ...commonMenuParams,
  });

  chrome.contextMenus.create({
    id: 'separator1',
    type: 'separator',
    ...commonMenuParams,
  });

  chrome.contextMenus.create({
    id: 'delete',
    title: chrome.i18n.getMessage('menuItemDelete'),
    ...commonMenuParams,
  });

  chrome.contextMenus.create({
    id: 'separator2',
    type: 'separator',
    ...commonMenuParams,
  });

  chrome.contextMenus.create({
    id: 'properties',
    title: chrome.i18n.getMessage('menuItemProperties'),
    ...commonMenuParams,
  });
};
