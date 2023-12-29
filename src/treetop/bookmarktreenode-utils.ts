/**
 * Check if a BookmarkTreeNode is a bookmark.
 */
export function isBookmark(node: chrome.bookmarks.BookmarkTreeNode): boolean {
  return node.url !== undefined;
}

/**
 * Check if a BookmarkTreeNode is a folder.
 */
export function isFolder(node: chrome.bookmarks.BookmarkTreeNode): boolean {
  return node.url === undefined;
}
