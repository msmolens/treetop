// Bookmark roots have special permanent GUIDs, see
// https://searchfox.org/mozilla-central/rev/7b36c8b83337c4b4cdfd4ccc2168f3491a86811b/toolkit/components/places/Bookmarks.sys.mjs#139-147
export const MOBILE_BOOKMARKS_GUID = 'mobile______';

// bookmarks.BookmarkTreeNodeType strings
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNodeType
export const BOOKMARK_TREE_NODE_TYPE_BOOKMARK = 'bookmark';
export const BOOKMARK_TREE_NODE_TYPE_FOLDER = 'folder';
export const BOOKMARK_TREE_NODE_TYPE_SEPARATOR = 'separator';
