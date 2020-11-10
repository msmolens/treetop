import { get, writable } from 'svelte/store';
import { browser } from 'webextension-polyfill-ts';

import { BOOKMARK_TREE_NODE_TYPE_BOOKMARK } from './constants';
import * as Treetop from './types';

/**
 * Class to initialize and manage updating last visit time stores for bookmarks.
 */
export class HistoryManager {
  private loaded = false;

  constructor(private readonly lastVisitTimeMap: Treetop.LastVisitTimeMap) {}

  /**
   * Initialize default last visit time stores for all bookmark nodes.
   */
  init(nodeStoreMap: Treetop.NodeStoreMap): void {
    for (const nodeStore of nodeStoreMap.values()) {
      const node: Treetop.FolderNode = get(nodeStore);
      node.children.forEach((child) => {
        if (child.type === Treetop.NodeType.Bookmark) {
          this.lastVisitTimeMap.set(child.id, writable(0));
        }
      });
    }
  }

  /**
   * Load history for all bookmarks and initialize last visit time stores.
   */
  async loadHistory(nodeStoreMap: Treetop.NodeStoreMap): Promise<void> {
    if (this.loaded) {
      return;
    }

    // Parallel arrays
    const nodeIds: string[] = [];
    const promises: Promise<browser.history.VisitItem[]>[] = [];

    //
    // Get last visit time of bookmarked URLs
    //

    for (const nodeStore of nodeStoreMap.values()) {
      const node: Treetop.FolderNode = get(nodeStore);
      node.children.forEach((child) => {
        if (child.type === Treetop.NodeType.Bookmark) {
          const promise = browser.history.getVisits({
            url: child.url,
          });
          promises.push(promise);
          nodeIds.push(child.id);
        }
      });
    }

    // Update last visit times
    const results = await Promise.all(promises);
    results.forEach((items, index) => {
      if (items.length > 0) {
        const lastVisitTime = this.lastVisitTimeMap.get(nodeIds[index])!;
        lastVisitTime.set(items[0].visitTime!);
      }
    });

    this.loaded = true;
  }

  /**
   * Reset all last visit time stores.
   */
  unloadHistory(): void {
    for (const lastVisitTime of this.lastVisitTimeMap.values()) {
      lastVisitTime.set(0);
    }

    this.loaded = false;
  }

  /**
   * Create a last visit time store for a newly created bookmark node.
   */
  async handleBookmarkCreated(
    _id: string,
    bookmark: browser.bookmarks.BookmarkTreeNode
  ): Promise<void> {
    if (bookmark.type !== BOOKMARK_TREE_NODE_TYPE_BOOKMARK) {
      return;
    }

    const items = await browser.history.getVisits({
      url: bookmark.url!,
    });

    const visitTime = items.length > 0 ? items[0].visitTime! : 0;
    const lastVisitTime = writable(visitTime);
    this.lastVisitTimeMap.set(bookmark.id, lastVisitTime);
  }

  /**
   * Delete the last visit time store for a removed bookmark.
   */
  handleBookmarkRemoved(id: string): void {
    this.lastVisitTimeMap.delete(id);
  }

  /**
   * Update the last visit time store for a modified bookmark.
   */
  async handleBookmarkChanged(
    id: string,
    changeInfo: browser.bookmarks._OnChangedChangeInfo
  ): Promise<void> {
    // Ignore changed folders
    if (changeInfo.url === undefined) {
      return;
    }

    const items = await browser.history.getVisits({
      url: changeInfo.url,
    });

    const lastVisitTime = this.lastVisitTimeMap.get(id)!;
    const newLastVisitTime = items.length > 0 ? items[0].visitTime! : 0;
    lastVisitTime.set(newLastVisitTime);
  }

  /**
   * Update the last visit time store when the user visits a bookmarked URL.
   */
  async handleVisited(result: browser.history.HistoryItem): Promise<void> {
    // Update bookmark nodes that match the visited URL
    const nodes = await browser.bookmarks.search({
      url: result.url,
    });

    nodes.forEach((node) => {
      const lastVisitTime = this.lastVisitTimeMap.get(node.id)!;
      lastVisitTime.set(result.lastVisitTime!);
    });
  }

  /**
   * Reset the last visit time stores when a page is removed from the browser
   * history.
   */
  async handleVisitRemoved(
    removed: browser.history._OnVisitRemovedRemoved
  ): Promise<void> {
    if (removed.allHistory) {
      // All history was removed
      for (const lastVisitTime of this.lastVisitTimeMap.values()) {
        lastVisitTime.set(0);
      }
    } else {
      // Get bookmark nodes that match the removed URL
      const nodes = await browser.bookmarks.search({
        url: removed.urls[0],
      });

      nodes.forEach((node) => {
        const lastVisitTime = this.lastVisitTimeMap.get(node.id)!;
        lastVisitTime.set(0);
      });
    }
  }
}
