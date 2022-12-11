import faker from 'faker';
import type { Bookmarks, History } from 'webextension-polyfill';

import { BOOKMARK_TREE_NODE_TYPE_SEPARATOR } from '@Treetop/treetop/constants';
import * as Treetop from '@Treetop/treetop/types';

const TITLE_NUM_RANDOM_WORDS = 3;

const BOOKMARKS_ROOT_GUID = 'bookmarks-root-id';
const BOOKMARKS_TOOLBAR_GUID = 'bookmarks-toolbar-id';
const OTHER_BOOKMARKS_GUID = 'other-bookmarks-ids';

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
  parent: Bookmarks.BookmarkTreeNode
): Bookmarks.BookmarkTreeNode => {
  const node: Bookmarks.BookmarkTreeNode = {
    id: faker.datatype.uuid(),
    parentId: parent.id,
    title: faker.random.words(TITLE_NUM_RANDOM_WORDS),
    url: faker.internet.url(),
  };
  parent.children!.push(node);
  return node;
};

export const createBrowserFolderNode = (
  parent: Bookmarks.BookmarkTreeNode
): Bookmarks.BookmarkTreeNode => {
  const node: Bookmarks.BookmarkTreeNode = {
    id: faker.datatype.uuid(),
    parentId: parent.id,
    title: faker.random.words(TITLE_NUM_RANDOM_WORDS),
    children: [],
  };
  parent.children!.push(node);
  return node;
};

export const createBrowserSeparatorNode = (
  parent: Bookmarks.BookmarkTreeNode
): Bookmarks.BookmarkTreeNode => {
  const node: Bookmarks.BookmarkTreeNode = {
    id: faker.datatype.uuid(),
    parentId: parent.id,
    title: '',
    type: BOOKMARK_TREE_NODE_TYPE_SEPARATOR,
    url: '',
  };
  parent.children!.push(node);
  return node;
};

export const createBookmarksToolbarNode = (): Bookmarks.BookmarkTreeNode => {
  return {
    id: BOOKMARKS_TOOLBAR_GUID,
    parentId: BOOKMARKS_ROOT_GUID,
    title: 'Bookmarks Toolbar',
    children: [],
  };
};

export const createOtherBookmarksNode = (): Bookmarks.BookmarkTreeNode => {
  return {
    id: OTHER_BOOKMARKS_GUID,
    parentId: BOOKMARKS_ROOT_GUID,
    title: 'Other Bookmarks',
    children: [],
  };
};

export const createBookmarksRootNode = (): Bookmarks.BookmarkTreeNode => {
  return {
    id: BOOKMARKS_ROOT_GUID,
    parentId: undefined,
    url: undefined,
    title: '',
    children: [createBookmarksToolbarNode(), createOtherBookmarksNode()],
  };
};

export const createBrowserBookmarksTree = (): Bookmarks.BookmarkTreeNode[] => {
  const rootNode = createBookmarksRootNode();
  return [rootNode];
};

//
// Browser history factories
//

export const createHistoryItem = (): History.HistoryItem => {
  return {
    id: faker.datatype.uuid(),
    url: faker.internet.url(),
    lastVisitTime: faker.datatype.number(),
  };
};

export const createVisitItem = (): History.VisitItem => {
  return {
    id: faker.datatype.uuid(),
    visitId: faker.datatype.uuid(),
    visitTime: faker.datatype.number(),
    referringVisitId: faker.datatype.uuid(),
    transition: 'link',
  };
};
