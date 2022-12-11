import type { Bookmarks } from 'webextension-polyfill';

import {
  BOOKMARK_TREE_NODE_TYPE_BOOKMARK,
  BOOKMARK_TREE_NODE_TYPE_FOLDER,
  BOOKMARK_TREE_NODE_TYPE_SEPARATOR,
} from './constants';

/**
 * Check if a BookmarkTreeNode is a bookmark.
 */
export function isBookmark(node: Bookmarks.BookmarkTreeNode): boolean {
  return (
    node.type === BOOKMARK_TREE_NODE_TYPE_BOOKMARK ||
    (node.url !== undefined && !isSeparator(node))
  );
}

/**
 * Check if a BookmarkTreeNode is a folder.
 */
export function isFolder(node: Bookmarks.BookmarkTreeNode): boolean {
  return node.type === BOOKMARK_TREE_NODE_TYPE_FOLDER || node.url === undefined;
}

/**
 * Check if a BookmarkTreeNode is a separator.
 */
export function isSeparator(node: Bookmarks.BookmarkTreeNode): boolean {
  return node.type === BOOKMARK_TREE_NODE_TYPE_SEPARATOR;
}
