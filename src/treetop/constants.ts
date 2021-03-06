// Bookmark roots have special permanent GUIDs, see
// firefox-78.0.1/toolkit/components/places/Bookmarks.jsm#L155-159
export const BOOKMARKS_ROOT_GUID = 'root________';
export const BOOKMARKS_TOOLBAR_GUID = 'toolbar_____';
export const BOOKMARKS_MENU_GUID = 'menu________';
export const MOBILE_BOOKMARKS_GUID = 'mobile______';
export const OTHER_BOOKMARKS_GUID = 'unfiled_____';

// bookmarks.BookmarkTreeNodeType strings
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNodeType
export const BOOKMARK_TREE_NODE_TYPE_BOOKMARK = 'bookmark';
export const BOOKMARK_TREE_NODE_TYPE_FOLDER = 'folder';
export const BOOKMARK_TREE_NODE_TYPE_SEPARATOR = 'separator';
