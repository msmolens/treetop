import { isBookmark } from './bookmarktreenode-utils';
import * as Treetop from './types';

/**
 * Get the most recently visited item from a list of chrome.history.VisitItems.
 * The `chrome.history.getVisits` API behaves differently depending on the
 * browser:
 *
 *   Chrome: Visits are sorted in chronological order.
 *   Firefox: Visits are sorted in reverse chronological order.
 *
 * See:
 * - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/getVisits
 * - https://bugzilla.mozilla.org/show_bug.cgi?id=1389588
 *
 */
function getMostRecentItem(items: chrome.history.VisitItem[]) {
  // The most recent item is either the first or the last, depending on the
  // browser
  const first = items.at(0);
  const last = items.at(-1);

  const firstVisitTime = first?.visitTime ?? 0;
  const lastVisitTime = last?.visitTime ?? 0;

  return firstVisitTime > lastVisitTime ? first : last;
}

/**
 * Class to initialize and manage updating last visit times for bookmarks.
 */
export class HistoryManager {
  private loaded = false;

  constructor(private readonly lastVisitTimeMap: Treetop.LastVisitTimeMap) {}

  /**
   * Initialize default last visit time for all bookmark nodes.
   */
  init(folderNodeMap: Treetop.FolderNodeMap): void {
    for (const folderNode of folderNodeMap.values()) {
      folderNode.children.forEach((child) => {
        if (child.type === Treetop.NodeType.Bookmark) {
          this.lastVisitTimeMap.set(child.id, 0);
        }
      });
    }
  }

  /**
   * Load history for all bookmarks and initialize last visit times.
   */
  async loadHistory(folderNodeMap: Treetop.FolderNodeMap): Promise<void> {
    if (this.loaded) {
      return;
    }

    // Parallel arrays
    const nodeIds: string[] = [];
    const promises: Promise<chrome.history.VisitItem[]>[] = [];

    //
    // Get last visit time of bookmarked URLs
    //

    for (const folderNode of folderNodeMap.values()) {
      folderNode.children.forEach((child) => {
        if (child.type === Treetop.NodeType.Bookmark) {
          const promise = chrome.history.getVisits({
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
      const mostRecentItem = getMostRecentItem(items);
      if (mostRecentItem?.visitTime) {
        this.lastVisitTimeMap.set(nodeIds[index], mostRecentItem.visitTime);
      }
    });

    this.loaded = true;
  }

  /**
   * Reset all last visit times.
   */
  unloadHistory(): void {
    for (const nodeId of this.lastVisitTimeMap.keys()) {
      this.lastVisitTimeMap.set(nodeId, 0);
    }

    this.loaded = false;
  }

  /**
   * Create a last visit time for a newly created bookmark node.
   */
  async handleBookmarkCreated(
    _id: string,
    bookmark: chrome.bookmarks.BookmarkTreeNode,
  ): Promise<void> {
    if (!isBookmark(bookmark)) {
      return;
    }

    const items = await chrome.history.getVisits({
      url: bookmark.url!,
    });

    const mostRecentItem = getMostRecentItem(items);
    const visitTime = mostRecentItem?.visitTime ?? 0;
    this.lastVisitTimeMap.set(bookmark.id, visitTime);
  }

  /**
   * Delete the last visit time for a removed bookmark.
   */
  handleBookmarkRemoved(id: string): void {
    this.lastVisitTimeMap.delete(id);
  }

  /**
   * Update the last visit time for a modified bookmark.
   */
  async handleBookmarkChanged(
    id: string,
    changeInfo: Treetop.BookmarkChangeInfo,
  ): Promise<void> {
    // Ignore changed folders
    if (changeInfo.url === undefined) {
      return;
    }

    const items = await chrome.history.getVisits({
      url: changeInfo.url,
    });

    const mostRecentItem = getMostRecentItem(items);
    const newLastVisitTime = mostRecentItem?.visitTime ?? 0;
    this.lastVisitTimeMap.set(id, newLastVisitTime);
  }

  /**
   * Update the last visit time when the user visits a bookmarked URL.
   */
  async handleVisited(result: chrome.history.HistoryItem): Promise<void> {
    // Update bookmark nodes that match the visited URL
    const nodes = await chrome.bookmarks.search({
      url: result.url,
    });

    nodes.forEach((node) => {
      this.lastVisitTimeMap.set(node.id, result.lastVisitTime!);
    });
  }

  /**
   * Reset the last visit times when a page is removed from the browser history.
   */
  async handleVisitRemoved(
    removed: Treetop.HistoryRemovedResult,
  ): Promise<void> {
    if (removed.allHistory) {
      // All history was removed
      for (const nodeId of this.lastVisitTimeMap.keys()) {
        this.lastVisitTimeMap.set(nodeId, 0);
      }
    } else {
      // TODO: Investigate why `removed.urls` is sometimes empty on Chrome
      const url = removed.urls?.at(0);
      if (url) {
        // Get bookmark nodes that match the removed URL
        const nodes = await chrome.bookmarks.search({ url });

        nodes.forEach((node) => {
          this.lastVisitTimeMap.set(node.id, 0);
        });
      }
    }
  }
}
