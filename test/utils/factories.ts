import faker from 'faker';

import * as Treetop from '@Treetop/treetop/types';

const TITLE_NUM_RANDOM_WORDS = 3;

const BOOKMARKS_ROOT_GUID = 'bookmarks-root-id';
const BOOKMARKS_TOOLBAR_GUID = 'bookmarks-toolbar-id';
const OTHER_BOOKMARKS_GUID = 'other-bookmarks-ids';

//
// Treetop node factories
//

export const createBookmarkNode = (
  withProperties?: Partial<Omit<Treetop.BookmarkNode, 'type'>>,
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
  withProperties?: Partial<Omit<Treetop.FolderNode, 'type'>>,
): Treetop.FolderNode => {
  return {
    id: faker.datatype.uuid(),
    type: Treetop.NodeType.Folder,
    title: faker.random.words(TITLE_NUM_RANDOM_WORDS),
    children: [],
    ...withProperties,
  };
};

//
// Browser bookmark factories
//

export const createBrowserBookmarkNode = (
  parent: chrome.bookmarks.BookmarkTreeNode,
): chrome.bookmarks.BookmarkTreeNode => {
  const node: chrome.bookmarks.BookmarkTreeNode = {
    id: faker.datatype.uuid(),
    parentId: parent.id,
    title: faker.random.words(TITLE_NUM_RANDOM_WORDS),
    url: faker.internet.url(),
    syncing: false,
  };
  parent.children!.push(node);
  return node;
};

export const createBrowserFolderNode = (
  parent: chrome.bookmarks.BookmarkTreeNode,
): chrome.bookmarks.BookmarkTreeNode => {
  const node: chrome.bookmarks.BookmarkTreeNode = {
    id: faker.datatype.uuid(),
    parentId: parent.id,
    title: faker.random.words(TITLE_NUM_RANDOM_WORDS),
    syncing: false,
    children: [],
  };
  parent.children!.push(node);
  return node;
};

export const createBookmarksToolbarNode =
  (): chrome.bookmarks.BookmarkTreeNode => {
    return {
      id: BOOKMARKS_TOOLBAR_GUID,
      parentId: BOOKMARKS_ROOT_GUID,
      title: 'Bookmarks Toolbar',
      syncing: false,
      children: [],
    };
  };

export const createOtherBookmarksNode =
  (): chrome.bookmarks.BookmarkTreeNode => {
    return {
      id: OTHER_BOOKMARKS_GUID,
      parentId: BOOKMARKS_ROOT_GUID,
      title: 'Other Bookmarks',
      syncing: false,
      children: [],
    };
  };

export const createBookmarksRootNode =
  (): chrome.bookmarks.BookmarkTreeNode => {
    return {
      id: BOOKMARKS_ROOT_GUID,
      parentId: undefined,
      url: undefined,
      title: '',
      syncing: false,
      children: [createBookmarksToolbarNode(), createOtherBookmarksNode()],
    };
  };

export const createBrowserBookmarksTree =
  (): chrome.bookmarks.BookmarkTreeNode[] => {
    const rootNode = createBookmarksRootNode();
    return [rootNode];
  };

//
// Browser history factories
//

export const createHistoryItem = (): chrome.history.HistoryItem => {
  return {
    id: faker.datatype.uuid(),
    url: faker.internet.url(),
    lastVisitTime: faker.datatype.number(),
  };
};

export const createVisitItem = (): chrome.history.VisitItem => {
  return {
    id: faker.datatype.uuid(),
    visitId: faker.datatype.uuid(),
    visitTime: faker.datatype.number(),
    referringVisitId: faker.datatype.uuid(),
    transition: 'link',
    isLocal: true,
  };
};
