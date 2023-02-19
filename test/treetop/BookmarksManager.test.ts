/* eslint no-irregular-whitespace: ["error", { "skipComments": true }] */

import { get, type Writable } from 'svelte/store';
import faker from 'faker';
import type { Bookmarks } from 'webextension-polyfill';

import { BookmarksManager } from '@Treetop/treetop/BookmarksManager';
import {
  BOOKMARKS_MENU_GUID,
  BOOKMARKS_ROOT_GUID,
  BOOKMARKS_TOOLBAR_GUID,
  MOBILE_BOOKMARKS_GUID,
  OTHER_BOOKMARKS_GUID,
} from '@Treetop/treetop/constants';
import * as Treetop from '@Treetop/treetop/types';

import {
  createBrowserBookmarkNode,
  createBrowserBookmarksTree,
  createBrowserFolderNode,
  createBrowserSeparatorNode,
} from '../utils/factories';

const getFolderNode = (
  store: Writable<Treetop.FolderNode> | undefined
): Treetop.FolderNode => {
  if (store === undefined) {
    throw new TypeError();
  }

  return get(store);
};

let nodeStoreMap: Treetop.NodeStoreMap;
let bookmarksManager: BookmarksManager;
let bookmarksTree: Bookmarks.BookmarkTreeNode[];
let bookmarksRoot: Bookmarks.BookmarkTreeNode;

const NUM_BOOKMARK_ROOTS = 4;

beforeEach(() => {
  nodeStoreMap = new Map() as Treetop.NodeStoreMap;
  bookmarksTree = createBrowserBookmarksTree();
  bookmarksRoot = bookmarksTree[0];
  bookmarksManager = new BookmarksManager(nodeStoreMap);
});

describe('loadBookmarks', () => {
  it('creates nodes for built-in bookmark roots', async () => {
    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS);

    expect(nodeStoreMap.get(BOOKMARKS_ROOT_GUID)).toBeDefined();
    expect(get(nodeStoreMap.get(BOOKMARKS_ROOT_GUID)!)).toMatchObject({
      id: BOOKMARKS_ROOT_GUID,
      type: Treetop.NodeType.Folder,
      title: '',
    });

    expect(nodeStoreMap.get(BOOKMARKS_MENU_GUID)).toBeDefined();
    expect(get(nodeStoreMap.get(BOOKMARKS_MENU_GUID)!)).toMatchObject({
      id: BOOKMARKS_MENU_GUID,
      type: Treetop.NodeType.Folder,
      title: 'Bookmarks Menu',
    });

    expect(nodeStoreMap.get(BOOKMARKS_TOOLBAR_GUID)).toBeDefined();
    expect(get(nodeStoreMap.get(BOOKMARKS_TOOLBAR_GUID)!)).toMatchObject({
      id: BOOKMARKS_TOOLBAR_GUID,
      type: Treetop.NodeType.Folder,
      title: 'Bookmarks Toolbar',
    });

    expect(nodeStoreMap.get(OTHER_BOOKMARKS_GUID)).toBeDefined();
    expect(get(nodeStoreMap.get(OTHER_BOOKMARKS_GUID)!)).toMatchObject({
      id: OTHER_BOOKMARKS_GUID,
      type: Treetop.NodeType.Folder,
      title: 'Other Bookmarks',
    });

    expect(nodeStoreMap.has(MOBILE_BOOKMARKS_GUID)).toBe(false);
  });

  it('creates nodes for folders', async () => {
    // Create one or more folders under each root
    const folders = [0, 1, 1, 2, 2, 2].map((index) => {
      return createBrowserFolderNode(bookmarksRoot.children![index]);
    });

    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + folders.length);

    for (const folder of folders) {
      expect(nodeStoreMap.get(folder.id)).toBeDefined();
      expect(get(nodeStoreMap.get(folder.id)!)).toMatchObject({
        id: folder.id,
        type: Treetop.NodeType.Folder,
        title: folder.title,
        children: [],
      });
    }
  });

  it('creates nodes for nested folders', async () => {
    // Create a folder and two folders within it
    const parentFolder = createBrowserFolderNode(bookmarksRoot.children![0]);
    const childFolder1 = createBrowserFolderNode(parentFolder);
    const childFolder2 = createBrowserFolderNode(parentFolder);

    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + 3);

    expect(nodeStoreMap.get(parentFolder.id)).toBeDefined();
    expect(get(nodeStoreMap.get(parentFolder.id)!)).toMatchObject({
      id: parentFolder.id,
      type: Treetop.NodeType.Folder,
      title: parentFolder.title,
      children: [
        {
          id: childFolder1.id,
          type: Treetop.NodeType.Folder,
          title: childFolder1.title,
        },
        {
          id: childFolder2.id,
          type: Treetop.NodeType.Folder,
          title: childFolder2.title,
        },
      ],
    });

    expect(nodeStoreMap.get(childFolder1.id)).toBeDefined();
    expect(get(nodeStoreMap.get(childFolder1.id)!)).toMatchObject({
      id: childFolder1.id,
      type: Treetop.NodeType.Folder,
      title: childFolder1.title,
      children: [],
    });

    expect(nodeStoreMap.get(childFolder2.id)).toBeDefined();
    expect(get(nodeStoreMap.get(childFolder2.id)!)).toMatchObject({
      id: childFolder2.id,
      type: Treetop.NodeType.Folder,
      title: childFolder2.title,
      children: [],
    });
  });

  it("includes bookmarks in folder's children", async () => {
    // Create a folder and bookmarks within it
    const folder = createBrowserFolderNode(bookmarksRoot.children![0]);
    const bookmarks = [];
    for (let i = 0; i < 3; i++) {
      bookmarks.push(createBrowserBookmarkNode(folder));
    }

    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + 1);

    expect(nodeStoreMap.get(folder.id)).toBeDefined();
    expect(get(nodeStoreMap.get(folder.id)!)).toMatchObject({
      id: folder.id,
      type: Treetop.NodeType.Folder,
      title: folder.title,
      children: [
        {
          id: bookmarks[0].id,
          type: Treetop.NodeType.Bookmark,
          title: bookmarks[0].title,
          url: bookmarks[0].url,
        },
        {
          id: bookmarks[1].id,
          type: Treetop.NodeType.Bookmark,
          title: bookmarks[1].title,
          url: bookmarks[1].url,
        },
        {
          id: bookmarks[2].id,
          type: Treetop.NodeType.Bookmark,
          title: bookmarks[2].title,
          url: bookmarks[2].url,
        },
      ],
    });
  });

  it("includes separators in folder's children", async () => {
    // Create a folder and a separators within it
    const folder = createBrowserFolderNode(bookmarksRoot.children![0]);
    const separator = createBrowserSeparatorNode(folder);

    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + 1);

    expect(nodeStoreMap.get(folder.id)).toBeDefined();
    expect(get(nodeStoreMap.get(folder.id)!)).toMatchObject({
      id: folder.id,
      type: Treetop.NodeType.Folder,
      title: folder.title,
      children: [
        {
          id: separator.id,
          type: Treetop.NodeType.Separator,
        },
      ],
    });
  });

  it("reorders root boookmark node's children", async () => {
    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS);
    expect(nodeStoreMap.get(BOOKMARKS_ROOT_GUID)).toBeDefined();
    expect(get(nodeStoreMap.get(BOOKMARKS_ROOT_GUID)!)).toMatchObject({
      id: BOOKMARKS_ROOT_GUID,
      type: Treetop.NodeType.Folder,
      title: '',
      children: [
        {
          id: BOOKMARKS_TOOLBAR_GUID,
          type: Treetop.NodeType.Folder,
          title: 'Bookmarks Toolbar',
        },
        {
          id: BOOKMARKS_MENU_GUID,
          type: Treetop.NodeType.Folder,
          title: 'Bookmarks Menu',
        },
        {
          id: OTHER_BOOKMARKS_GUID,
          type: Treetop.NodeType.Folder,
          title: 'Other Bookmarks',
        },
      ],
    });
  });
});

describe('handleBookmarkCreated', () => {
  let folderNode: Bookmarks.BookmarkTreeNode;

  beforeEach(async () => {
    // Create bookmarks tree:
    // base
    //   ├── bookmarkNode
    //   └─── folderNode
    //       └── bookmarkNode
    const baseNode = bookmarksRoot.children![0];
    createBrowserBookmarkNode(baseNode);
    folderNode = createBrowserFolderNode(baseNode);
    createBrowserBookmarkNode(folderNode);
    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);
    await bookmarksManager.loadBookmarks();
    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + 1);
    expect(nodeStoreMap.get(baseNode.id)).toBeDefined();
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      2
    );
    expect(nodeStoreMap.get(folderNode.id)).toBeDefined();
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children
    ).toHaveLength(1);
  });

  it('created bookmark', async () => {
    // Create a new bookmark node
    const node = createBrowserBookmarkNode(folderNode);
    const children = folderNode.children!;
    delete folderNode.children;
    mockBrowser.bookmarks.get.expect(folderNode.id).andResolve([folderNode]);
    mockBrowser.bookmarks.getChildren
      .expect(folderNode.id)
      .andResolve(children);

    // Call bookmark created handler
    await bookmarksManager.handleBookmarkCreated(node.id, node);

    // New node store is not created for a bookmark
    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + 1);

    // New bookmark node appears in parent node's children
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children
    ).toHaveLength(2);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children
    ).toContainEqual({
      id: node.id,
      type: Treetop.NodeType.Bookmark,
      title: node.title,
      url: node.url!,
    });
  });

  it('created separator', async () => {
    // Create a new separator node
    const node = createBrowserSeparatorNode(folderNode);
    const children = folderNode.children!;
    delete folderNode.children;
    mockBrowser.bookmarks.get.expect(folderNode.id).andResolve([folderNode]);
    mockBrowser.bookmarks.getChildren
      .expect(folderNode.id)
      .andResolve(children);

    // Call bookmark created handler
    await bookmarksManager.handleBookmarkCreated(node.id, node);

    // New node store is not created for a separator
    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + 1);

    // New separator node appears in parent node's children
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children
    ).toHaveLength(2);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children
    ).toContainEqual({
      id: node.id,
      type: Treetop.NodeType.Separator,
    });
  });

  it('created folder', async () => {
    // Create a new folder node
    const node = createBrowserFolderNode(folderNode);

    let children = node.children!;
    delete node.children;
    mockBrowser.bookmarks.get.expect(node.id).andResolve([node]);
    mockBrowser.bookmarks.getChildren.expect(node.id).andResolve(children);

    children = folderNode.children!;
    delete folderNode.children;
    mockBrowser.bookmarks.get.expect(folderNode.id).andResolve([folderNode]);
    mockBrowser.bookmarks.getChildren
      .expect(folderNode.id)
      .andResolve(children);

    // Call bookmark created handler
    await bookmarksManager.handleBookmarkCreated(node.id, node);

    // New node store is created for a folder
    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + 2);
    expect(nodeStoreMap.get(node.id)).toBeDefined();
    expect(getFolderNode(nodeStoreMap.get(node.id))).toMatchObject({
      id: node.id,
      type: Treetop.NodeType.Folder,
      title: node.title,
      children: node.children,
    });

    // New folder node appears in parent node's children
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children
    ).toHaveLength(2);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children
    ).toContainEqual({
      id: node.id,
      type: Treetop.NodeType.Folder,
      title: node.title,
      children: [],
    });
  });
});

describe('handleBookmarkRemoved', () => {
  let baseNode: Bookmarks.BookmarkTreeNode;
  let folderNode1: Bookmarks.BookmarkTreeNode;
  let folderNode2: Bookmarks.BookmarkTreeNode;
  let bookmarkNode1: Bookmarks.BookmarkTreeNode;
  let bookmarkNode2: Bookmarks.BookmarkTreeNode;
  let bookmarkNode3: Bookmarks.BookmarkTreeNode;
  let bookmarkNode4: Bookmarks.BookmarkTreeNode;
  let separatorNode: Bookmarks.BookmarkTreeNode;

  beforeEach(async () => {
    // Create bookmarks tree:
    // base
    //   ├── bookmarkNode1
    //   └─── folderNode1
    //       ├── bookmarkNode2
    //       ├── bookmarkNode3
    //       └── folderNode2
    //           ├── bookmarkNode4
    //           └── separatorNode
    baseNode = bookmarksRoot.children![0];
    bookmarkNode1 = createBrowserBookmarkNode(baseNode);
    folderNode1 = createBrowserFolderNode(baseNode);
    bookmarkNode2 = createBrowserBookmarkNode(folderNode1);
    bookmarkNode3 = createBrowserBookmarkNode(folderNode1);
    folderNode2 = createBrowserFolderNode(folderNode1);
    bookmarkNode4 = createBrowserBookmarkNode(folderNode2);
    separatorNode = createBrowserSeparatorNode(folderNode2);
    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);
    await bookmarksManager.loadBookmarks();
    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + 2);
    expect(nodeStoreMap.get(baseNode.id)).toBeDefined();
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      2
    );
    expect(nodeStoreMap.get(folderNode1.id)).toBeDefined();
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(3);
    expect(nodeStoreMap.get(folderNode2.id)).toBeDefined();
    expect(
      getFolderNode(nodeStoreMap.get(folderNode2.id)).children.length
    ).toBe(2);

    bookmarkNode1;
  });

  it('removed bookmark', async () => {
    const children = folderNode2.children!;
    delete folderNode2.children;
    children.shift();
    mockBrowser.bookmarks.get.expect(folderNode2.id).andResolve([folderNode2]);
    mockBrowser.bookmarks.getChildren
      .expect(folderNode2.id)
      .andResolve(children);
    expect(folderNode2.id).toBe(bookmarkNode4.parentId);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode2.id)).children.length
    ).toBe(2);

    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Call bookmark removed handler
    const removeInfo: Bookmarks.OnRemovedRemoveInfoType = {
      parentId: bookmarkNode4.parentId!,
      index: 0,
      node: bookmarkNode4,
    };
    const removedNodeIds = await bookmarksManager.handleBookmarkRemoved(
      removeInfo.node.id,
      removeInfo
    );

    expect(removedNodeIds).toHaveLength(1);
    expect(removedNodeIds).toContain(bookmarkNode4.id);
    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode2.id)).children.length
    ).toBe(1);
  });

  it('removed separator', async () => {
    const children = folderNode2.children!;
    delete folderNode2.children;
    children.pop();
    mockBrowser.bookmarks.get.expect(folderNode2.id).andResolve([folderNode2]);
    mockBrowser.bookmarks.getChildren
      .expect(folderNode2.id)
      .andResolve(children);
    expect(folderNode2.id).toBe(separatorNode.parentId);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode2.id)).children.length
    ).toBe(2);
    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Call bookmark removed handler
    const removeInfo: Bookmarks.OnRemovedRemoveInfoType = {
      parentId: separatorNode.parentId!,
      index: 1,
      node: separatorNode,
    };
    const removedNodeIds = await bookmarksManager.handleBookmarkRemoved(
      removeInfo.node.id,
      removeInfo
    );

    expect(removedNodeIds).toHaveLength(1);
    expect(removedNodeIds).toContain(separatorNode.id);
    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode2.id)).children.length
    ).toBe(1);
  });

  it('removed folder', async () => {
    const children = baseNode.children!.slice(0, 1);
    delete baseNode.children;
    mockBrowser.bookmarks.get.expect(baseNode.id).andResolve([baseNode]);
    mockBrowser.bookmarks.getChildren.expect(baseNode.id).andResolve(children);
    expect(baseNode.id).toBe(folderNode1.parentId);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      2
    );
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(3);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode2.id)).children.length
    ).toBe(2);
    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Call bookmark removed handler
    const removeInfo: Bookmarks.OnRemovedRemoveInfoType = {
      parentId: folderNode1.parentId!,
      index: 1,
      node: folderNode1,
    };
    const removedNodeIds = await bookmarksManager.handleBookmarkRemoved(
      removeInfo.node.id,
      removeInfo
    );

    expect(removedNodeIds).toHaveLength(6);
    expect(removedNodeIds).toContain(folderNode1.id);
    expect(removedNodeIds).toContain(bookmarkNode2.id);
    expect(removedNodeIds).toContain(bookmarkNode3.id);
    expect(removedNodeIds).toContain(folderNode2.id);
    expect(removedNodeIds).toContain(bookmarkNode4.id);
    expect(removedNodeIds).toContain(separatorNode.id);
    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize - 2);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      1
    );
  });
});

describe('handleBookmarkChanged', () => {
  let baseNode: Bookmarks.BookmarkTreeNode;
  let folderNode1: Bookmarks.BookmarkTreeNode;
  let bookmarkNode1: Bookmarks.BookmarkTreeNode;
  let bookmarkNode2: Bookmarks.BookmarkTreeNode;

  beforeEach(async () => {
    // Create bookmarks tree:
    // base
    //   └─── folderNode1
    //       ├── bookmarkNode1
    //       └── bookmarkNode2
    baseNode = bookmarksRoot.children![0];
    folderNode1 = createBrowserFolderNode(baseNode);
    bookmarkNode1 = createBrowserBookmarkNode(folderNode1);
    bookmarkNode2 = createBrowserBookmarkNode(folderNode1);
    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);
    await bookmarksManager.loadBookmarks();
    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + 1);
    expect(nodeStoreMap.get(baseNode.id)).toBeDefined();
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      1
    );
    expect(nodeStoreMap.get(folderNode1.id)).toBeDefined();
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(2);
  });

  it('changed bookmark', async () => {
    expect(folderNode1.id).toBe(bookmarkNode1.parentId);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(2);
    expect(
      (
        getFolderNode(nodeStoreMap.get(folderNode1.id))
          .children[0] as Treetop.BookmarkNode
      ).title
    ).toBe(bookmarkNode1.title);
    expect(
      (
        getFolderNode(nodeStoreMap.get(folderNode1.id))
          .children[0] as Treetop.BookmarkNode
      ).url
    ).toBe(bookmarkNode1.url);
    const initialNodeStoreMapSize = nodeStoreMap.size;

    bookmarkNode1.title = faker.random.words();
    bookmarkNode1.url = faker.internet.url();
    folderNode1.children![0] = bookmarkNode1;
    mockBrowser.bookmarks.get
      .expect(bookmarkNode1.id)
      .andResolve([bookmarkNode1]);
    mockBrowser.bookmarks.get.expect(folderNode1.id).andResolve([folderNode1]);
    mockBrowser.bookmarks.getChildren
      .expect(folderNode1.id)
      .andResolve(folderNode1.children!);

    // Call bookmark changed handler
    const changeInfo: Bookmarks.OnChangedChangeInfoType = {
      title: bookmarkNode1.title,
      url: bookmarkNode1.url,
    };
    await bookmarksManager.handleBookmarkChanged(bookmarkNode1.id, changeInfo);

    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(2);
    expect(
      (
        getFolderNode(nodeStoreMap.get(folderNode1.id))
          .children[0] as Treetop.BookmarkNode
      ).title
    ).toBe(bookmarkNode1.title);
    expect(
      (
        getFolderNode(nodeStoreMap.get(folderNode1.id))
          .children[0] as Treetop.BookmarkNode
      ).url
    ).toBe(bookmarkNode1.url);
  });

  it('changed folder', async () => {
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(2);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode1.id
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode2.id
    );
    const initialNodeStoreMapSize = nodeStoreMap.size;

    folderNode1.title = faker.random.words();
    mockBrowser.bookmarks.get.expect(folderNode1.id).andResolve([folderNode1]);
    mockBrowser.bookmarks.getChildren
      .expect(folderNode1.id)
      .andResolve(folderNode1.children!);

    // Call bookmark changed handler
    const changeInfo: Bookmarks.OnChangedChangeInfoType = {
      title: folderNode1.title,
    };
    await bookmarksManager.handleBookmarkChanged(folderNode1.id, changeInfo);

    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).title).toBe(
      folderNode1.title
    );
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(2);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode1.id
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode2.id
    );
  });
});

describe('handleBookmarkMoved', () => {
  let baseNode: Bookmarks.BookmarkTreeNode;
  let folderNode1: Bookmarks.BookmarkTreeNode;
  let bookmarkNode1: Bookmarks.BookmarkTreeNode;
  let bookmarkNode2: Bookmarks.BookmarkTreeNode;
  let bookmarkNode3: Bookmarks.BookmarkTreeNode;

  beforeEach(async () => {
    // Create bookmarks tree:
    // base
    //   ├── bookmarkNode1
    //   └─── folderNode1
    //       ├── bookmarkNode2
    //       └── bookmarkNode3
    baseNode = bookmarksRoot.children![0];
    bookmarkNode1 = createBrowserBookmarkNode(baseNode);
    folderNode1 = createBrowserFolderNode(baseNode);
    bookmarkNode2 = createBrowserBookmarkNode(folderNode1);
    bookmarkNode3 = createBrowserBookmarkNode(folderNode1);
    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);
    await bookmarksManager.loadBookmarks();
    expect(nodeStoreMap.size).toBe(NUM_BOOKMARK_ROOTS + 1);
    expect(nodeStoreMap.get(baseNode.id)).toBeDefined();
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      2
    );
    expect(nodeStoreMap.get(folderNode1.id)).toBeDefined();
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(2);
    bookmarkNode1;
  });

  it('moved within folder', async () => {
    expect(baseNode.id).toBe(bookmarkNode1.parentId);
    expect(baseNode.id).toBe(folderNode1.parentId);
    expect(folderNode1.id).toBe(bookmarkNode2.parentId);
    expect(folderNode1.id).toBe(bookmarkNode3.parentId);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode2.id
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode3.id
    );
    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Move bookmarkNode3 to index 0
    const children = folderNode1.children!;
    const moveInfo: Bookmarks.OnMovedMoveInfoType = {
      parentId: bookmarkNode3.parentId!,
      index: 0,
      oldParentId: bookmarkNode3.parentId!,
      oldIndex: 1,
    };
    [children[0], children[1]] = [children[1], children[0]];
    mockBrowser.bookmarks.get.expect(folderNode1.id).andResolve([folderNode1]);
    mockBrowser.bookmarks.getChildren
      .expect(folderNode1.id)
      .andResolve(folderNode1.children!);

    // Call bookmark moved handler
    await bookmarksManager.handleBookmarkMoved(bookmarkNode3.id, moveInfo);

    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(2);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode3.id
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode2.id
    );
  });

  it('moved to parent folder', async () => {
    expect(baseNode.id).toBe(bookmarkNode1.parentId);
    expect(baseNode.id).toBe(folderNode1.parentId);
    expect(folderNode1.id).toBe(bookmarkNode2.parentId);
    expect(folderNode1.id).toBe(bookmarkNode3.parentId);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[0].id).toBe(
      bookmarkNode1.id
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[1].id).toBe(
      folderNode1.id
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode2.id
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode3.id
    );
    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Move bookmarkNode3 to base folder
    baseNode.children!.unshift(folderNode1.children!.pop()!);
    const moveInfo: Bookmarks.OnMovedMoveInfoType = {
      parentId: baseNode.id,
      index: 0,
      oldParentId: folderNode1.id,
      oldIndex: 1,
    };
    mockBrowser.bookmarks.get.expect(baseNode.id).andResolve([baseNode]);
    mockBrowser.bookmarks.getChildren
      .expect(baseNode.id)
      .andResolve(baseNode.children!);
    mockBrowser.bookmarks.get.expect(folderNode1.id).andResolve([folderNode1]);
    mockBrowser.bookmarks.getChildren
      .expect(folderNode1.id)
      .andResolve(folderNode1.children!);

    // Call bookmark moved handler
    await bookmarksManager.handleBookmarkMoved(bookmarkNode3.id, moveInfo);

    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      3
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[0].id).toBe(
      bookmarkNode3.id
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[1].id).toBe(
      bookmarkNode1.id
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[2].id).toBe(
      folderNode1.id
    );
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(1);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode2.id
    );
  });

  it('moved to child folder', async () => {
    expect(baseNode.id).toBe(bookmarkNode1.parentId);
    expect(baseNode.id).toBe(folderNode1.parentId);
    expect(folderNode1.id).toBe(bookmarkNode2.parentId);
    expect(folderNode1.id).toBe(bookmarkNode3.parentId);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[0].id).toBe(
      bookmarkNode1.id
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[1].id).toBe(
      folderNode1.id
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode2.id
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode3.id
    );
    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Move bookmarkNode1 to folderNode1
    folderNode1.children!.unshift(baseNode.children!.shift()!);
    const moveInfo: Bookmarks.OnMovedMoveInfoType = {
      parentId: folderNode1.id,
      index: 0,
      oldParentId: baseNode.id,
      oldIndex: 0,
    };
    mockBrowser.bookmarks.get.expect(folderNode1.id).andResolve([folderNode1]);
    mockBrowser.bookmarks.getChildren
      .expect(folderNode1.id)
      .andResolve(folderNode1.children!);
    mockBrowser.bookmarks.get.expect(baseNode.id).andResolve([baseNode]);
    mockBrowser.bookmarks.getChildren
      .expect(baseNode.id)
      .andResolve(baseNode.children!);

    // Call bookmark moved handler
    await bookmarksManager.handleBookmarkMoved(bookmarkNode1.id, moveInfo);

    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      1
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[0].id).toBe(
      folderNode1.id
    );
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length
    ).toBe(3);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode1.id
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode2.id
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[2].id).toBe(
      bookmarkNode3.id
    );
  });
});
