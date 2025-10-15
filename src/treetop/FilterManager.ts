import { get } from 'svelte/store';

import { isBookmark } from './bookmarktreenode-utils';
import * as Treetop from './types';

/**
 * Class to identify bookmarks that match a filter string.
 * Matching applies to the title and URL and is case-insensitive.
 *
 * When one or more bookmarks match a filter, the FilterSet contains the IDs of:
 * - the matching bookmarks
 * - all the folders above each bookmark on the path to the root folder
 */
export class FilterManager {
  private filter: string | null = null;
  private inBatchRemove = false;

  constructor(
    private readonly filterSet: Treetop.FilterSet,
    private readonly folderNodeMap: Treetop.FolderNodeMap,
  ) {}

  /**
   * Set a filter string and update the FilterSet.
   */
  setFilter(filter: string): void {
    this.filter = filter.toLowerCase();

    // Pass 1:
    // Add bookmarks that match the filter string to the FilterSet.
    // Additionally, add their immediate parent folders to the FilterSet.
    for (const folderNode of this.folderNodeMap.values()) {
      let addedChild = false;

      const node: Treetop.FolderNode = get(folderNode);
      for (const child of node.children) {
        if (child.type === Treetop.NodeType.Bookmark) {
          if (
            this.matchesFilter(child.title) ||
            this.matchesFilter(child.url)
          ) {
            this.filterSet.add(child.id);
            addedChild = true;
          }
        }
      }

      if (addedChild) {
        this.filterSet.add(node.id);
      }
    }

    // Pass 2
    // For each folder in the FilterSet, add the folders on the path to the root
    // folder.
    for (const folderNode of this.folderNodeMap.values()) {
      const node: Treetop.FolderNode = get(folderNode);
      if (this.filterSet.has(node.id)) {
        let curNode = node;
        while (curNode.parentId) {
          curNode = get(this.folderNodeMap.get(curNode.parentId)!);
          this.filterSet.add(curNode.id);
        }
      }
    }
  }

  /**
   * Clear the filter string.
   */
  clearFilter(): void {
    this.filter = null;

    this.filterSet.clear();
  }

  /**
   * Update the FilterSet for a newly created bookmark node.
   */
  handleBookmarkCreated(
    _id: string,
    bookmark: chrome.bookmarks.BookmarkTreeNode,
  ): void {
    if (this.filter === null) {
      return;
    }

    if (!isBookmark(bookmark)) {
      return;
    }

    if (
      !this.matchesFilter(bookmark.title) &&
      !this.matchesFilter(bookmark.url!)
    ) {
      return;
    }

    // Add the bookmark to the FilterSet
    this.filterSet.add(bookmark.id);

    // Add the folders on the path to the root folder to the FilterSet
    let parentId = bookmark.parentId;
    while (parentId) {
      const node = get(this.folderNodeMap.get(parentId)!);
      this.filterSet.add(node.id);
      parentId = node.parentId;
    }
  }

  /**
   * Indicate the start of a batch removal of bookmarks.
   * The updates may be delayed until the end of the batch.
   */
  beginBatchRemove(): void {
    this.inBatchRemove = true;
  }

  /**
   * Indicate the end of a batch removal of bookmarks.
   */
  endBatchRemove(): void {
    if (this.inBatchRemove) {
      this.inBatchRemove = false;
      this.refreshFilter();
    }
  }

  /**
   * Update the FilterSet for a removed bookmark.
   */
  handleBookmarkRemoved(_id: string): void {
    if (!this.inBatchRemove) {
      this.refreshFilter();
    }
  }

  /**
   * Update the FilterSet for a modified bookmark.
   */
  handleBookmarkChanged(
    _id: string,
    _changeInfo: Treetop.BookmarkChangeInfo,
  ): void {
    this.refreshFilter();
  }

  /**
   * Update the Filterset when a bookmark is moved to a different folder or to a
   * new offset within its folder.
   */
  handleBookmarkMoved(_id: string, _moveInfo: Treetop.BookmarkMoveInfo): void {
    this.refreshFilter();
  }

  /**
   * Check whether a string matches the filter case-insensitively.
   */
  private matchesFilter(str: string) {
    return str.toLowerCase().includes(this.filter!);
  }

  /**
   * Clear and rebuild the FilterSet.
   */
  private refreshFilter() {
    const filter = this.filter;
    if (filter) {
      this.clearFilter();
      this.setFilter(filter);
    }
  }
}
