import browser, { type Menus, type Tabs } from 'webextension-polyfill';

import type { MenuItem } from './MenuItem';

/**
 * Class to handle menu events and delegate to registered menu items.
 */
export class MenuManager {
  // The context menu's target element
  activeElement: HTMLElement | null = null;

  private readonly menuItems = new Map<string, MenuItem>();

  // Track shown menu instance ID
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/onShown
  private lastMenuInstanceId = 0;
  private nextMenuInstanceId = 1;

  /**
   * Register a menu item.
   */
  registerMenuItem(id: string, item: MenuItem): void {
    this.menuItems.set(id, item);
  }

  /**
   * Update whether menu items are enabled when the menu is shown.
   * The menu must have been opened in the 'link' context in the current Treetop
   * tab.
   */
  async handleMenuShown(
    info: Menus.OnShownInfoType,
    tab: Tabs.Tab,
  ): Promise<void> {
    if (!info.contexts.includes('link') || info.viewType !== 'tab') {
      return;
    }

    // Get match pattern for the extension's origin
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions#Host_permissions
    const origin = browser.runtime.getURL('');
    if (!info.pageUrl || !info.pageUrl.startsWith(origin)) {
      return;
    }

    // Store menu instance ID before calling async function
    const menuInstanceId = this.nextMenuInstanceId;
    ++this.nextMenuInstanceId;
    this.lastMenuInstanceId = menuInstanceId;

    const currentTab = await browser.tabs.getCurrent();
    if (currentTab.id !== tab.id) {
      return;
    }

    // Check whether the same menu is still shown
    if (menuInstanceId !== this.lastMenuInstanceId) {
      return;
    }

    // Update whether menu items are enabled based on the target bookmark
    const nodeId = this.activeElement?.dataset.nodeId;
    if (nodeId) {
      await this.updateEnabled(nodeId);
    }
  }

  /**
   * Clean up state when the menu is hidden.
   */
  handleMenuHidden(): void {
    // Reset the menu instance ID
    this.lastMenuInstanceId = 0;

    // Clear the active element
    this.activeElement = null;
  }

  /**
   * Call a registered menu item handler when a menu item is clicked.
   * The menu must have been clicked in the current Treetop tab.
   */
  async handleMenuClicked(
    info: Menus.OnClickData,
    tab?: Tabs.Tab,
  ): Promise<void> {
    // Store current active element; it may be cleared while waiting for an
    // asynchronous function call
    const activeElement = this.activeElement;

    if (info.viewType !== 'tab' || !tab) {
      return;
    }

    const currentTab = await browser.tabs.getCurrent();
    if (currentTab.id !== tab.id) {
      return;
    }

    // Call the menu item handler
    const nodeId = activeElement?.dataset.nodeId;
    if (nodeId && info.menuItemId) {
      const item = this.menuItems.get(info.menuItemId as string);
      item?.onClicked(nodeId);
    }
  }

  /**
   * Update whether menu items are enabled based on the target node.
   */
  async updateEnabled(nodeId: string): Promise<void> {
    for (const [id, item] of this.menuItems.entries()) {
      const enabled = item.enabled(nodeId);
      await browser.contextMenus.update(id, { enabled });
    }

    await browser.contextMenus.refresh();
  }
}
