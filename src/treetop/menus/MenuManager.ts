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
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
  ): Promise<void> {
    // Store current active element; it may be cleared while waiting for an
    // asynchronous function call
    const activeElement = this.activeElement;

    if (!tab) {
      return;
    }

    const currentTab = await chrome.tabs.getCurrent();
    if (currentTab?.id !== tab.id) {
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
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await chrome.contextMenus.update(id, { enabled });
    }

    if ('refresh' in chrome.contextMenus) {
      // @ts-expect-error contextMenus.refresh() is available only on Firefox
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await chrome.contextMenus.refresh();
    }
  }
}
