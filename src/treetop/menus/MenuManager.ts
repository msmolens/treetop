import browser, { type Menus, type Tabs } from 'webextension-polyfill';

import type { MenuItem } from './MenuItem';

/**
 * Class to handle menu events and delegate to registered menu items.
 */
export class MenuManager {
  // The context menu's target element
  activeElement: HTMLElement | null = null;

  private readonly menuItems = new Map<string, MenuItem>();

  /**
   * Register a menu item.
   */
  registerMenuItem(id: string, item: MenuItem): void {
    this.menuItems.set(id, item);
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

    // Clear the active element
    this.activeElement = null;
  }

  /**
   * Update whether menu items are enabled based on the target node.
   */
  async updateEnabled(): Promise<void> {
    const nodeId = this.activeElement?.dataset.nodeId;
    if (!nodeId) {
      return;
    }

    for (const [id, item] of this.menuItems.entries()) {
      const enabled = item.enabled(nodeId);
      await browser.contextMenus.update(id, { enabled });
    }

    await browser.contextMenus.refresh();
  }
}
