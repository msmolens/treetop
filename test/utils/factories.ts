import faker from 'faker';

import {
  BOOKMARK_TREE_NODE_TYPE_BOOKMARK,
  BOOKMARK_TREE_NODE_TYPE_FOLDER,
  BOOKMARK_TREE_NODE_TYPE_SEPARATOR,
  BOOKMARKS_MENU_GUID,
  BOOKMARKS_ROOT_GUID,
  BOOKMARKS_TOOLBAR_GUID,
  MOBILE_BOOKMARKS_GUID,
  OTHER_BOOKMARKS_GUID,
} from '@Treetop/treetop/constants';
import * as Treetop from '@Treetop/treetop/types';

const TITLE_NUM_RANDOM_WORDS = 3;

//
// Treetop node factories
//

export const createBookmarkNode = (
  withProperties?: Partial<Omit<Treetop.BookmarkNode, 'type'>>
): Treetop.BookmarkNode => {
  return {
    id: faker.datatype.uuid(),
    type: Treetop.NodeType.Bookmark,
    title: faker.random.words(TITLE_NUM_RANDOM_WORDS),
    url: faker.internet.url(),
    ...withProperties,
  };
};

export const createFolderNode = (
  withProperties?: Partial<Omit<Treetop.FolderNode, 'type'>>
): Treetop.FolderNode => {
  return {
    id: faker.datatype.uuid(),
    type: Treetop.NodeType.Folder,
    title: faker.random.words(TITLE_NUM_RANDOM_WORDS),
    children: [],
    ...withProperties,
  };
};

export const createSeparatorNode = (
  withProperties?: Partial<Omit<Treetop.SeparatorNode, 'type'>>
): Treetop.SeparatorNode => {
  return {
    id: faker.datatype.uuid(),
    type: Treetop.NodeType.Separator,
    ...withProperties,
  };
};

//
// Browser bookmark factories
//

export const createBrowserBookmarkNode = (
  parent: browser.bookmarks.BookmarkTreeNode
): browser.bookmarks.BookmarkTreeNode => {
  const node: browser.bookmarks.BookmarkTreeNode = {
    id: faker.datatype.uuid(),
    parentId: parent.id,
    title: faker.random.words(TITLE_NUM_RANDOM_WORDS),
    type: BOOKMARK_TREE_NODE_TYPE_BOOKMARK,
    url: faker.internet.url(),
  };
  parent.children!.push(node);
  return node;
};

export const createBrowserFolderNode = (
  parent: browser.bookmarks.BookmarkTreeNode
): browser.bookmarks.BookmarkTreeNode => {
  const node: browser.bookmarks.BookmarkTreeNode = {
    id: faker.datatype.uuid(),
    parentId: parent.id,
    title: faker.random.words(TITLE_NUM_RANDOM_WORDS),
    type: BOOKMARK_TREE_NODE_TYPE_FOLDER,
    children: [],
  };
  parent.children!.push(node);
  return node;
};

export const createBrowserSeparatorNode = (
  parent: browser.bookmarks.BookmarkTreeNode
): browser.bookmarks.BookmarkTreeNode => {
  const node: browser.bookmarks.BookmarkTreeNode = {
    id: faker.datatype.uuid(),
    parentId: parent.id,
    title: '',
    type: BOOKMARK_TREE_NODE_TYPE_SEPARATOR,
    url: '',
  };
  parent.children!.push(node);
  return node;
};

export const createBookmarksMenuNode =
  (): browser.bookmarks.BookmarkTreeNode => {
    return {
      id: BOOKMARKS_MENU_GUID,
      parentId: BOOKMARKS_ROOT_GUID,
      title: 'Bookmarks Menu',
      type: BOOKMARK_TREE_NODE_TYPE_FOLDER,
      children: [],
    };
  };

export const createBookmarksToolbarNode =
  (): browser.bookmarks.BookmarkTreeNode => {
    return {
      id: BOOKMARKS_TOOLBAR_GUID,
      parentId: BOOKMARKS_ROOT_GUID,
      title: 'Bookmarks Toolbar',
      type: BOOKMARK_TREE_NODE_TYPE_FOLDER,
      children: [],
    };
  };

export const createOtherBookmarksNode =
  (): browser.bookmarks.BookmarkTreeNode => {
    return {
      id: OTHER_BOOKMARKS_GUID,
      parentId: BOOKMARKS_ROOT_GUID,
      title: 'Other Bookmarks',
      type: BOOKMARK_TREE_NODE_TYPE_FOLDER,
      children: [],
    };
  };

export const createMobileBookmarksNode =
  (): browser.bookmarks.BookmarkTreeNode => {
    return {
      id: MOBILE_BOOKMARKS_GUID,
      parentId: BOOKMARKS_ROOT_GUID,
      title: 'Mobile Bookmarks',
      type: BOOKMARK_TREE_NODE_TYPE_FOLDER,
      children: [],
    };
  };

export const createBookmarksRootNode =
  (): browser.bookmarks.BookmarkTreeNode => {
    return {
      id: BOOKMARKS_ROOT_GUID,
      parentId: undefined,
      url: undefined,
      type: BOOKMARK_TREE_NODE_TYPE_FOLDER,
      title: '',
      children: [
        createBookmarksMenuNode(),
        createBookmarksToolbarNode(),
        createOtherBookmarksNode(),
        createMobileBookmarksNode(),
      ],
    };
  };

export const createBrowserBookmarksTree =
  (): browser.bookmarks.BookmarkTreeNode[] => {
    const rootNode = createBookmarksRootNode();
    return [rootNode];
  };

//
// Browser history factories
//

export const createHistoryItem = (): browser.history.HistoryItem => {
  return {
    id: faker.datatype.uuid(),
    url: faker.internet.url(),
    lastVisitTime: faker.datatype.number(),
  };
};

export const createVisitItem = (): browser.history.VisitItem => {
  return {
    id: faker.datatype.uuid(),
    visitId: faker.datatype.uuid(),
    visitTime: faker.datatype.number(),
    referringVisitId: faker.datatype.uuid(),
    transition: 'link',
  };
};
