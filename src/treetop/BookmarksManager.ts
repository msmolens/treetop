import { get, writable } from 'svelte/store';
import browser, { type Bookmarks } from 'webextension-polyfill';

import {
  BOOKMARK_TREE_NODE_TYPE_BOOKMARK,
  BOOKMARK_TREE_NODE_TYPE_FOLDER,
  BOOKMARK_TREE_NODE_TYPE_SEPARATOR,
  BOOKMARKS_MENU_GUID,
  BOOKMARKS_TOOLBAR_GUID,
  OTHER_BOOKMARKS_GUID,
} from './constants';
import * as Treetop from './types';

// Map bookmarks.BookmarkTreeNodeType to Treetop.NodeType
const BookmarkTypeMap: Map<Bookmarks.BookmarkTreeNodeType, Treetop.NodeType> =
  new Map([
    [BOOKMARK_TREE_NODE_TYPE_BOOKMARK, Treetop.NodeType.Bookmark],
    [BOOKMARK_TREE_NODE_TYPE_FOLDER, Treetop.NodeType.Folder],
    [BOOKMARK_TREE_NODE_TYPE_SEPARATOR, Treetop.NodeType.Separator],
  ]);

/**
 * Class to initialize and manage updating bookmark node stores.
 */
export class BookmarksManager {
  constructor(private readonly nodeStoreMap: Treetop.NodeStoreMap) {}

  /**
   * Load all bookmarks and initialize node stores for folders.
   */
  async loadBookmarks(): Promise<void> {
    const nodes = await browser.bookmarks.getTree();
    this.orderBookmarksRootChildren(nodes[0]);

    while (nodes.length > 0) {
      const node = nodes.pop()!;

      if (node.type === BOOKMARK_TREE_NODE_TYPE_FOLDER) {
        this.buildNodeStore(node);
        nodes.push(...node.children!);
      }
    }
  }

  /**
   * Convert a BookmarkTreeNode into a Treetop folder node. Retain the only
   * necessary properties from the original node and its children.
   */
  private convertNode(node: Bookmarks.BookmarkTreeNode): Treetop.FolderNode {
    const newNode: Treetop.FolderNode = {
      id: node.id,
      parentId: node.parentId,
      type: Treetop.NodeType.Folder,
      title: node.title,
      children: node.children!.map((child): Treetop.Node => {
        let newChild: Treetop.Node;
        const type = BookmarkTypeMap.get(child.type!)!;
        switch (type) {
          case Treetop.NodeType.Bookmark:
            newChild = {
              type,
              id: child.id,
              title: child.title,
              url: child.url!,
            };
            break;
          case Treetop.NodeType.Folder:
            newChild = {
              type,
              id: child.id,
              title: child.title,
              children: [],
            };
            break;
          case Treetop.NodeType.Separator:
            newChild = {
              type,
              id: child.id,
            };
            break;
          default:
            throw new TypeError();
        }

        return newChild;
      }),
    };

    return newNode;
  }

  /**
   * Create and record a node store for the specified bookmark node.
   */
  private buildNodeStore(node: Bookmarks.BookmarkTreeNode): void {
    if (node.type !== BOOKMARK_TREE_NODE_TYPE_FOLDER) {
      throw new TypeError();
    }

    const newNode = this.convertNode(node);
    const nodeStore = writable(newNode);
    this.nodeStoreMap.set(node.id, nodeStore);
  }

  /**
   * Update the node store for the specified bookmark ID.
   */
  private async updateNodeStore(nodeId: string): Promise<void> {
    const [node] = await browser.bookmarks.get(nodeId);

    if (node.type !== BOOKMARK_TREE_NODE_TYPE_FOLDER) {
      throw new TypeError();
    }

    node.children = await browser.bookmarks.getChildren(node.id);

    const newNode = this.convertNode(node);
    const nodeStore = this.nodeStoreMap.get(nodeId)!;
    nodeStore.set(newNode);
  }

  /**
   * Create a store for a newly created bookmark node.
   */
  async handleBookmarkCreated(
    id: string,
    bookmark: Bookmarks.BookmarkTreeNode
  ): Promise<void> {
    if (bookmark.type === BOOKMARK_TREE_NODE_TYPE_FOLDER) {
      // Add node store for the new folder
      const [node] = await browser.bookmarks.get(id);
      node.children = await browser.bookmarks.getChildren(id);
      this.buildNodeStore(node);
    }

    // Update parent node of the new bookmark
    await this.updateNodeStore(bookmark.parentId!);
  }

  /**
   * Delete stores for removed bookmarks. When the removed bookmark is a folder,
   * recursively delete stores for its children.
   *
   * @return Array of the removed bookmark node IDs.
   */
  async handleBookmarkRemoved(
    id: string,
    removeInfo: Bookmarks.OnRemovedRemoveInfoType
  ): Promise<string[]> {
    const removedNodeIds = [];

    if (removeInfo.node.type === BOOKMARK_TREE_NODE_TYPE_FOLDER) {
      const nodeStore = this.nodeStoreMap.get(id)!;
      const nodes: [Treetop.FolderNode] = [get(nodeStore)];

      while (nodes.length) {
        const node = nodes.pop()!;
        this.nodeStoreMap.delete(node.id);
        removedNodeIds.push(node.id);

        // Store removed bookmark IDs
        for (const child of node.children) {
          if (child.type !== Treetop.NodeType.Folder) {
            removedNodeIds.push(child.id);
          }
        }

        // Enqueue child folders for removal
        for (const childNodeStore of this.nodeStoreMap.values()) {
          const currentNode: Treetop.FolderNode = get(childNodeStore);
          if (currentNode.parentId === node.id) {
            nodes.push(currentNode);
          }
        }
      }
    } else {
      removedNodeIds.push(id);
    }

    // Update parent node of the deleted bookmark
    await this.updateNodeStore(removeInfo.parentId);

    return removedNodeIds;
  }

  /**
   * Update the store for a modified bookmark.
   */
  async handleBookmarkChanged(
    id: string,
    _changeInfo: Bookmarks.OnChangedChangeInfoType
  ): Promise<void> {
    if (this.nodeStoreMap.has(id)) {
      // Folder changed. Update its node.
      await this.updateNodeStore(id);
    } else {
      // Bookmark changed. Update the parent folder node.
      const [node] = await browser.bookmarks.get(id);
      await this.updateNodeStore(node.parentId!);
    }
  }

  /**
   * Update stores when a bookmark is moved to a different folder or to a new
   * offset within its folder.
   */
  async handleBookmarkMoved(
    _id: string,
    moveInfo: Bookmarks.OnMovedMoveInfoType
  ): Promise<void> {
    const parentId = moveInfo.parentId;
    const oldParentId = moveInfo.oldParentId;

    // Update parent folder
    await this.updateNodeStore(parentId);

    // Update old parent folder
    if (parentId !== oldParentId) {
      await this.updateNodeStore(oldParentId);
    }
  }

  /**
   * Order root bookmark node children like:
   * - Bookmarks Toolbar
   * - Bookmarks Menu
   * - Other Bookmarks
   *
   * Respect preference settings for whether to include each folder.
   *
   * Omit Mobile Bookmarks.
   */
  private orderBookmarksRootChildren(node: Bookmarks.BookmarkTreeNode): void {
    const children: Bookmarks.BookmarkTreeNode[] = [];

    const bookmarksToolbarNode = node.children!.find(
      ({ id }) => id === BOOKMARKS_TOOLBAR_GUID
    )!;
    children.push(bookmarksToolbarNode);

    const bookmarksMenuNode = node.children!.find(
      ({ id }) => id === BOOKMARKS_MENU_GUID
    )!;
    children.push(bookmarksMenuNode);

    const otherBookmarksNode = node.children!.find(
      ({ id }) => id === OTHER_BOOKMARKS_GUID
    )!;
    children.push(otherBookmarksNode);

    node.children = children;
  }
}
