import { get } from 'svelte/store';
import type { Bookmarks } from 'webextension-polyfill';

import { BOOKMARK_TREE_NODE_TYPE_BOOKMARK } from './constants';
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
    private readonly nodeStoreMap: Treetop.NodeStoreMap
  ) {}

  /**
   * Set a filter string and update the FilterSet.
   */
  setFilter(filter: string): void {
    this.filter = filter.toLowerCase();

    const filterSet = get(this.filterSet);

    // Pass 1:
    // Add bookmarks that match the filter string to the FilterSet.
    // Additionally, add their immediate parent folders to the FilterSet.
    for (const nodeStore of this.nodeStoreMap.values()) {
      const startFilterSetSize = filterSet.size;

      const folderNode: Treetop.FolderNode = get(nodeStore);
      folderNode.children.forEach((child) => {
        if (child.type === Treetop.NodeType.Bookmark) {
          if (
            this.matchesFilter(child.title) ||
            this.matchesFilter(child.url)
          ) {
            filterSet.add(child.id);
          }
        }
      });

      if (filterSet.size > startFilterSetSize) {
        filterSet.add(folderNode.id);
      }
    }

    // Pass 2
    // For each folder in the FilterSet, add the folders on the path to the root
    // folder.
    for (const nodeStore of this.nodeStoreMap.values()) {
      const node: Treetop.FolderNode = get(nodeStore);
      if (filterSet.has(node.id)) {
        let curNode = node;
        while (curNode.parentId) {
          curNode = get(this.nodeStoreMap.get(curNode.parentId)!);
          filterSet.add(curNode.id);
        }
      }
    }

    this.filterSet.set(filterSet);
  }

  /**
   * Clear the filter string.
   */
  clearFilter(): void {
    this.filter = null;

    this.filterSet.update((filterSet) => {
      filterSet.clear();
      return filterSet;
    });
  }

  /**
   * Update the FilterSet for a newly created bookmark node.
   */
  handleBookmarkCreated(
    _id: string,
    bookmark: Bookmarks.BookmarkTreeNode
  ): void {
    if (this.filter === null) {
      return;
    }

    if (bookmark.type !== BOOKMARK_TREE_NODE_TYPE_BOOKMARK) {
      return;
    }

    if (
      !this.matchesFilter(bookmark.title) &&
      !this.matchesFilter(bookmark.url!)
    ) {
      return;
    }

    const filterSet = get(this.filterSet);

    // Add the bookmark to the FilterSet
    filterSet.add(bookmark.id);

    // Add the folders on the path to the root folder to the FilterSet
    let parentId = bookmark.parentId;
    while (parentId) {
      const node = get(this.nodeStoreMap.get(parentId)!);
      filterSet.add(node.id);
      parentId = node.parentId;
    }

    this.filterSet.set(filterSet);
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
  handleBookmarkRemoved(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _id: string
  ): void {
    if (!this.inBatchRemove) {
      this.refreshFilter();
    }
  }

  /**
   * Update the FilterSet for a modified bookmark.
   */
  handleBookmarkChanged(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _id: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _changeInfo: Bookmarks.OnChangedChangeInfoType
  ): void {
    this.refreshFilter();
  }

  /**
   * Update the Filterset when a bookmark is moved to a different folder or to a
   * new offset within its folder.
   */
  handleBookmarkMoved(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _id: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _moveInfo: Bookmarks.OnMovedMoveInfoType
  ): void {
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
