import { get, writable } from 'svelte/store';

import { isBookmark, isFolder } from './bookmarktreenode-utils';
import { MOBILE_BOOKMARKS_GUID } from './constants';
import * as Treetop from './types';

/**
 * Class to initialize and manage updating bookmark node stores.
 */
export class BookmarksManager {
  constructor(
    private readonly nodeStoreMap: Treetop.NodeStoreMap,
    private readonly builtInFolderInfo: Treetop.BuiltInFolderInfo,
  ) {}

  /**
   * Load all bookmarks and initialize node stores for folders.
   * Initialize built-in folder info.
   */
  async loadBookmarks(): Promise<void> {
    const nodes = await chrome.bookmarks.getTree();

    // Store root node ID
    const rootNode = nodes[0];
    this.builtInFolderInfo.rootNodeId = rootNode.id;

    // Firefox: Exclude Mobile Bookmarks folder
    rootNode.children = rootNode.children?.filter(
      ({ id }) => id !== MOBILE_BOOKMARKS_GUID,
    );

    // Store built-in folder IDs (e.g. Other Bookmarks)
    this.builtInFolderInfo.builtInFolderIds = rootNode.children!.map(
      ({ id }) => id,
    );

    // Initialize node stores for folders
    while (nodes.length > 0) {
      const node = nodes.pop()!;

      if (isFolder(node)) {
        this.buildNodeStore(node);
        nodes.push(...node.children!);
      }
    }
  }

  /**
   * Convert a BookmarkTreeNode into a Treetop folder node. Retain the only
   * necessary properties from the original node and its children.
   */
  private convertNode(
    node: chrome.bookmarks.BookmarkTreeNode,
  ): Treetop.FolderNode {
    const children: Treetop.Node[] = node
      .children!.map((child): Treetop.Node | undefined => {
        if (isBookmark(child)) {
          return {
            id: child.id,
            title: child.title,
            type: Treetop.NodeType.Bookmark,
            url: child.url!,
          };
        }

        if (isFolder(child)) {
          return {
            id: child.id,
            title: child.title,
            type: Treetop.NodeType.Folder,
            children: [],
          };
        }

        return undefined;
      })
      .filter((child): child is Treetop.Node => Boolean(child));

    const newNode: Treetop.FolderNode = {
      id: node.id,
      parentId: node.parentId,
      type: Treetop.NodeType.Folder,
      title: node.title,
      children,
    };

    return newNode;
  }

  /**
   * Create and record a node store for the specified bookmark node.
   */
  private buildNodeStore(node: chrome.bookmarks.BookmarkTreeNode): void {
    const newNode = this.convertNode(node);
    const nodeStore = writable(newNode);
    this.nodeStoreMap.set(node.id, nodeStore);
  }

  /**
   * Update the node store for the specified bookmark ID.
   */
  private async updateNodeStore(nodeId: string): Promise<void> {
    const [node] = await chrome.bookmarks.get(nodeId);

    if (!isFolder(node)) {
      throw new TypeError();
    }

    node.children = await chrome.bookmarks.getChildren(node.id);

    const newNode = this.convertNode(node);
    const nodeStore = this.nodeStoreMap.get(nodeId)!;
    nodeStore.set(newNode);
  }

  /**
   * Create a store for a newly created bookmark node.
   */
  async handleBookmarkCreated(
    id: string,
    bookmark: chrome.bookmarks.BookmarkTreeNode,
  ): Promise<void> {
    if (isFolder(bookmark)) {
      // Add node store for the new folder
      const [node] = await chrome.bookmarks.get(id);
      node.children = await chrome.bookmarks.getChildren(id);
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
    removeInfo: Treetop.BookmarkRemoveInfo,
  ): Promise<string[]> {
    const removedNodeIds = [];

    if (isFolder(removeInfo.node)) {
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
    _changeInfo: Treetop.BookmarkChangeInfo,
  ): Promise<void> {
    if (this.nodeStoreMap.has(id)) {
      // Folder changed. Update its node.
      await this.updateNodeStore(id);
    } else {
      // Bookmark changed. Update the parent folder node.
      const [node] = await chrome.bookmarks.get(id);
      await this.updateNodeStore(node.parentId!);
    }
  }

  /**
   * Update stores when a bookmark is moved to a different folder or to a new
   * offset within its folder.
   */
  async handleBookmarkMoved(
    _id: string,
    moveInfo: Treetop.BookmarkMoveInfo,
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
}
