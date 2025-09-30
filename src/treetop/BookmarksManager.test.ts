/* eslint no-irregular-whitespace: ["error", { "skipComments": true }] */

import { get, type Writable } from 'svelte/store';
import faker from 'faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BookmarksManager } from '@Treetop/treetop/BookmarksManager';
import { MOBILE_BOOKMARKS_GUID } from '@Treetop/treetop/constants';
import * as Treetop from '@Treetop/treetop/types';

import {
  createBrowserBookmarkNode,
  createBrowserBookmarksTree,
  createBrowserFolderNode,
} from '../../test/utils/factories';

const getFolderNode = (
  store: Writable<Treetop.FolderNode> | undefined,
): Treetop.FolderNode => {
  if (store === undefined) {
    throw new TypeError();
  }

  return get(store);
};

let nodeStoreMap: Treetop.NodeStoreMap;
let bookmarksManager: BookmarksManager;
let bookmarksTree: chrome.bookmarks.BookmarkTreeNode[];
let bookmarksRoot: chrome.bookmarks.BookmarkTreeNode;
let numBuiltInFolders = 0;
let builtInFolderInfo: Treetop.BuiltInFolderInfo;

beforeEach(() => {
  nodeStoreMap = new Map() as Treetop.NodeStoreMap;
  bookmarksTree = createBrowserBookmarksTree();
  bookmarksRoot = bookmarksTree[0];
  numBuiltInFolders = 1 + bookmarksRoot.children!.length;
  builtInFolderInfo = {
    rootNodeId: null,
    builtInFolderIds: [],
  };
  bookmarksManager = new BookmarksManager(nodeStoreMap, builtInFolderInfo);
});

describe('loadBookmarks', () => {
  it('stores IDs for built-in folders', async () => {
    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);

    await bookmarksManager.loadBookmarks();

    expect(builtInFolderInfo.rootNodeId).toBe(bookmarksRoot.id);

    expect(builtInFolderInfo.builtInFolderIds).toEqual(
      bookmarksRoot.children?.map((node) => node.id),
    );
  });

  it('creates nodes for built-in bookmark roots', async () => {
    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(numBuiltInFolders);

    for (const folder of bookmarksRoot.children!) {
      expect(nodeStoreMap.get(folder.id)).toBeDefined();

      const node = get(nodeStoreMap.get(folder.id)!);
      expect(node.id).toBe(folder.id);
      expect(node.title).toBe(folder.title);
    }
  });

  it('excludes mobile bookmarks folder', async () => {
    const mobileBookmarksNode = createBrowserFolderNode(bookmarksRoot);
    mobileBookmarksNode.id = MOBILE_BOOKMARKS_GUID;

    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(numBuiltInFolders);

    expect(nodeStoreMap.has(MOBILE_BOOKMARKS_GUID)).toBe(false);
  });

  it('creates nodes for folders', async () => {
    // Create one or more folders in each built-in folder
    const folders = [0, 1, 1, 1].map((index) => {
      return createBrowserFolderNode(bookmarksRoot.children![index]);
    });

    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(numBuiltInFolders + folders.length);

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

    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(numBuiltInFolders + 3);

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

    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);

    await bookmarksManager.loadBookmarks();

    expect(nodeStoreMap.size).toBe(numBuiltInFolders + 1);

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
});

describe('handleBookmarkCreated', () => {
  let folderNode: chrome.bookmarks.BookmarkTreeNode;

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
    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);
    await bookmarksManager.loadBookmarks();
    expect(nodeStoreMap.size).toBe(numBuiltInFolders + 1);
    expect(nodeStoreMap.get(baseNode.id)).toBeDefined();
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      2,
    );
    expect(nodeStoreMap.get(folderNode.id)).toBeDefined();
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children,
    ).toHaveLength(1);
  });

  it('created bookmark', async () => {
    // Create a new bookmark node
    const node = createBrowserBookmarkNode(folderNode);
    const children = folderNode.children!;
    delete folderNode.children;

    const get = vi.fn().mockResolvedValue([folderNode]);
    vi.spyOn(chrome.bookmarks, 'get').mockImplementation(get);

    const getChildren = vi.fn().mockResolvedValue(children);
    vi.spyOn(chrome.bookmarks, 'getChildren').mockImplementation(getChildren);

    // Call bookmark created handler
    await bookmarksManager.handleBookmarkCreated(node.id, node);

    expect(get).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith(folderNode.id);
    expect(getChildren).toHaveBeenCalledOnce();
    expect(getChildren).toHaveBeenCalledWith(folderNode.id);

    // New node store is not created for a bookmark
    expect(nodeStoreMap.size).toBe(numBuiltInFolders + 1);

    // New bookmark node appears in parent node's children
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children,
    ).toHaveLength(2);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children,
    ).toContainEqual({
      id: node.id,
      type: Treetop.NodeType.Bookmark,
      title: node.title,
      url: node.url!,
    });
  });

  it('created folder', async () => {
    // Create a new folder node
    const node = createBrowserFolderNode(folderNode);

    let children = node.children!;
    delete node.children;

    const get = vi
      .fn()
      .mockResolvedValueOnce([node])
      .mockResolvedValueOnce([folderNode]);
    vi.spyOn(chrome.bookmarks, 'get').mockImplementation(get);

    const getChildren = vi.fn().mockResolvedValueOnce(children);
    vi.spyOn(chrome.bookmarks, 'getChildren').mockImplementation(getChildren);

    children = folderNode.children!;
    delete folderNode.children;

    getChildren.mockResolvedValueOnce(children);

    // Call bookmark created handler
    await bookmarksManager.handleBookmarkCreated(node.id, node);

    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenNthCalledWith(1, node.id);
    expect(get).toHaveBeenNthCalledWith(2, folderNode.id);
    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenNthCalledWith(1, node.id);
    expect(get).toHaveBeenNthCalledWith(2, folderNode.id);

    // New node store is created for a folder
    expect(nodeStoreMap.size).toBe(numBuiltInFolders + 2);
    expect(nodeStoreMap.get(node.id)).toBeDefined();
    expect(getFolderNode(nodeStoreMap.get(node.id))).toMatchObject({
      id: node.id,
      type: Treetop.NodeType.Folder,
      title: node.title,
      children: node.children,
    });

    // New folder node appears in parent node's children
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children,
    ).toHaveLength(2);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode.id)).children,
    ).toContainEqual({
      id: node.id,
      type: Treetop.NodeType.Folder,
      title: node.title,
      children: [],
    });
  });
});

describe('handleBookmarkRemoved', () => {
  let baseNode: chrome.bookmarks.BookmarkTreeNode;
  let folderNode1: chrome.bookmarks.BookmarkTreeNode;
  let folderNode2: chrome.bookmarks.BookmarkTreeNode;
  let bookmarkNode1: chrome.bookmarks.BookmarkTreeNode;
  let bookmarkNode2: chrome.bookmarks.BookmarkTreeNode;
  let bookmarkNode3: chrome.bookmarks.BookmarkTreeNode;
  let bookmarkNode4: chrome.bookmarks.BookmarkTreeNode;

  beforeEach(async () => {
    // Create bookmarks tree:
    // base
    //   ├── bookmarkNode1
    //   └─── folderNode1
    //       ├── bookmarkNode2
    //       ├── bookmarkNode3
    //       └── folderNode2
    //           └── bookmarkNode4
    baseNode = bookmarksRoot.children![0];
    bookmarkNode1 = createBrowserBookmarkNode(baseNode);
    folderNode1 = createBrowserFolderNode(baseNode);
    bookmarkNode2 = createBrowserBookmarkNode(folderNode1);
    bookmarkNode3 = createBrowserBookmarkNode(folderNode1);
    folderNode2 = createBrowserFolderNode(folderNode1);
    bookmarkNode4 = createBrowserBookmarkNode(folderNode2);
    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);
    await bookmarksManager.loadBookmarks();
    expect(nodeStoreMap.size).toBe(numBuiltInFolders + 2);
    expect(nodeStoreMap.get(baseNode.id)).toBeDefined();
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      2,
    );
    expect(nodeStoreMap.get(folderNode1.id)).toBeDefined();
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(3);
    expect(nodeStoreMap.get(folderNode2.id)).toBeDefined();
    expect(
      getFolderNode(nodeStoreMap.get(folderNode2.id)).children.length,
    ).toBe(1);

    void bookmarkNode1;
  });

  it('removed bookmark', async () => {
    const children = folderNode2.children!;
    delete folderNode2.children;
    children.shift();

    const get = vi.fn().mockResolvedValue([folderNode2]);
    vi.spyOn(chrome.bookmarks, 'get').mockImplementation(get);

    const getChildren = vi.fn().mockResolvedValue(children);
    vi.spyOn(chrome.bookmarks, 'getChildren').mockImplementation(getChildren);

    expect(folderNode2.id).toBe(bookmarkNode4.parentId);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode2.id)).children.length,
    ).toBe(1);

    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Call bookmark removed handler
    const removeInfo: Treetop.BookmarkRemoveInfo = {
      parentId: bookmarkNode4.parentId!,
      index: 0,
      node: bookmarkNode4,
    };
    const removedNodeIds = await bookmarksManager.handleBookmarkRemoved(
      removeInfo.node.id,
      removeInfo,
    );

    expect(get).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith(folderNode2.id);
    expect(getChildren).toHaveBeenCalledOnce();
    expect(getChildren).toHaveBeenCalledWith(folderNode2.id);

    expect(removedNodeIds).toHaveLength(1);
    expect(removedNodeIds).toContain(bookmarkNode4.id);
    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode2.id)).children.length,
    ).toBe(0);
  });

  it('removed folder', async () => {
    const children = baseNode.children!.slice(0, 1);
    delete baseNode.children;

    const get = vi.fn().mockResolvedValue([baseNode]);
    vi.spyOn(chrome.bookmarks, 'get').mockImplementation(get);

    const getChildren = vi.fn().mockResolvedValue(children);
    vi.spyOn(chrome.bookmarks, 'getChildren').mockImplementation(getChildren);

    expect(baseNode.id).toBe(folderNode1.parentId);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      2,
    );
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(3);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode2.id)).children.length,
    ).toBe(1);
    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Call bookmark removed handler
    const removeInfo: Treetop.BookmarkRemoveInfo = {
      parentId: folderNode1.parentId!,
      index: 1,
      node: folderNode1,
    };
    const removedNodeIds = await bookmarksManager.handleBookmarkRemoved(
      removeInfo.node.id,
      removeInfo,
    );

    expect(get).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith(baseNode.id);
    expect(getChildren).toHaveBeenCalledOnce();
    expect(getChildren).toHaveBeenCalledWith(baseNode.id);

    expect(removedNodeIds).toHaveLength(5);
    expect(removedNodeIds).toContain(folderNode1.id);
    expect(removedNodeIds).toContain(bookmarkNode2.id);
    expect(removedNodeIds).toContain(bookmarkNode3.id);
    expect(removedNodeIds).toContain(folderNode2.id);
    expect(removedNodeIds).toContain(bookmarkNode4.id);
    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize - 2);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      1,
    );
  });
});

describe('handleBookmarkChanged', () => {
  let baseNode: chrome.bookmarks.BookmarkTreeNode;
  let folderNode1: chrome.bookmarks.BookmarkTreeNode;
  let bookmarkNode1: chrome.bookmarks.BookmarkTreeNode;
  let bookmarkNode2: chrome.bookmarks.BookmarkTreeNode;

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
    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);
    await bookmarksManager.loadBookmarks();
    expect(nodeStoreMap.size).toBe(numBuiltInFolders + 1);
    expect(nodeStoreMap.get(baseNode.id)).toBeDefined();
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      1,
    );
    expect(nodeStoreMap.get(folderNode1.id)).toBeDefined();
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(2);
  });

  it('changed bookmark', async () => {
    expect(folderNode1.id).toBe(bookmarkNode1.parentId);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(2);
    expect(
      (
        getFolderNode(nodeStoreMap.get(folderNode1.id))
          .children[0] as Treetop.BookmarkNode
      ).title,
    ).toBe(bookmarkNode1.title);
    expect(
      (
        getFolderNode(nodeStoreMap.get(folderNode1.id))
          .children[0] as Treetop.BookmarkNode
      ).url,
    ).toBe(bookmarkNode1.url);
    const initialNodeStoreMapSize = nodeStoreMap.size;

    bookmarkNode1.title = faker.random.words();
    bookmarkNode1.url = faker.internet.url();
    folderNode1.children![0] = bookmarkNode1;

    const get = vi
      .fn()
      .mockResolvedValueOnce([bookmarkNode1])
      .mockResolvedValueOnce([folderNode1]);
    vi.spyOn(chrome.bookmarks, 'get').mockImplementation(get);

    const getChildren = vi.fn().mockResolvedValue(folderNode1.children);
    vi.spyOn(chrome.bookmarks, 'getChildren').mockImplementation(getChildren);

    // Call bookmark changed handler
    const changeInfo: Treetop.BookmarkChangeInfo = {
      title: bookmarkNode1.title,
      url: bookmarkNode1.url,
    };
    await bookmarksManager.handleBookmarkChanged(bookmarkNode1.id, changeInfo);

    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenNthCalledWith(1, bookmarkNode1.id);
    expect(get).toHaveBeenNthCalledWith(2, folderNode1.id);
    expect(getChildren).toHaveBeenCalledOnce();
    expect(getChildren).toHaveBeenCalledWith(folderNode1.id);

    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(2);
    expect(
      (
        getFolderNode(nodeStoreMap.get(folderNode1.id))
          .children[0] as Treetop.BookmarkNode
      ).title,
    ).toBe(bookmarkNode1.title);
    expect(
      (
        getFolderNode(nodeStoreMap.get(folderNode1.id))
          .children[0] as Treetop.BookmarkNode
      ).url,
    ).toBe(bookmarkNode1.url);
  });

  it('changed folder', async () => {
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(2);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode1.id,
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode2.id,
    );
    const initialNodeStoreMapSize = nodeStoreMap.size;

    folderNode1.title = faker.random.words();

    const get = vi.fn().mockResolvedValue([folderNode1]);
    vi.spyOn(chrome.bookmarks, 'get').mockImplementation(get);

    const getChildren = vi.fn().mockResolvedValue(folderNode1.children);
    vi.spyOn(chrome.bookmarks, 'getChildren').mockImplementation(getChildren);

    // Call bookmark changed handler
    const changeInfo: Treetop.BookmarkChangeInfo = {
      title: folderNode1.title,
    };
    await bookmarksManager.handleBookmarkChanged(folderNode1.id, changeInfo);

    expect(get).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith(folderNode1.id);
    expect(getChildren).toHaveBeenCalledOnce();
    expect(getChildren).toHaveBeenCalledWith(folderNode1.id);

    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).title).toBe(
      folderNode1.title,
    );
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(2);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode1.id,
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode2.id,
    );
  });
});

describe('handleBookmarkMoved', () => {
  let baseNode: chrome.bookmarks.BookmarkTreeNode;
  let folderNode1: chrome.bookmarks.BookmarkTreeNode;
  let bookmarkNode1: chrome.bookmarks.BookmarkTreeNode;
  let bookmarkNode2: chrome.bookmarks.BookmarkTreeNode;
  let bookmarkNode3: chrome.bookmarks.BookmarkTreeNode;

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
    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);
    await bookmarksManager.loadBookmarks();
    expect(nodeStoreMap.size).toBe(numBuiltInFolders + 1);
    expect(nodeStoreMap.get(baseNode.id)).toBeDefined();
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      2,
    );
    expect(nodeStoreMap.get(folderNode1.id)).toBeDefined();
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(2);
    void bookmarkNode1;
  });

  it('moved within folder', async () => {
    expect(baseNode.id).toBe(bookmarkNode1.parentId);
    expect(baseNode.id).toBe(folderNode1.parentId);
    expect(folderNode1.id).toBe(bookmarkNode2.parentId);
    expect(folderNode1.id).toBe(bookmarkNode3.parentId);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode2.id,
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode3.id,
    );
    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Move bookmarkNode3 to index 0
    const children = folderNode1.children!;
    const moveInfo: Treetop.BookmarkMoveInfo = {
      parentId: bookmarkNode3.parentId!,
      index: 0,
      oldParentId: bookmarkNode3.parentId!,
      oldIndex: 1,
    };
    [children[0], children[1]] = [children[1], children[0]];

    const get = vi.fn().mockResolvedValue([folderNode1]);
    vi.spyOn(chrome.bookmarks, 'get').mockImplementation(get);

    const getChildren = vi.fn().mockResolvedValue(folderNode1.children);
    vi.spyOn(chrome.bookmarks, 'getChildren').mockImplementation(getChildren);

    // Call bookmark moved handler
    await bookmarksManager.handleBookmarkMoved(bookmarkNode3.id, moveInfo);

    expect(get).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith(folderNode1.id);
    expect(getChildren).toHaveBeenCalledOnce();
    expect(getChildren).toHaveBeenCalledWith(folderNode1.id);

    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(2);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode3.id,
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode2.id,
    );
  });

  it('moved to parent folder', async () => {
    expect(baseNode.id).toBe(bookmarkNode1.parentId);
    expect(baseNode.id).toBe(folderNode1.parentId);
    expect(folderNode1.id).toBe(bookmarkNode2.parentId);
    expect(folderNode1.id).toBe(bookmarkNode3.parentId);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[0].id).toBe(
      bookmarkNode1.id,
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[1].id).toBe(
      folderNode1.id,
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode2.id,
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode3.id,
    );
    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Move bookmarkNode3 to base folder
    baseNode.children!.unshift(folderNode1.children!.pop()!);
    const moveInfo: Treetop.BookmarkMoveInfo = {
      parentId: baseNode.id,
      index: 0,
      oldParentId: folderNode1.id,
      oldIndex: 1,
    };

    const get = vi
      .fn()
      .mockResolvedValueOnce([baseNode])
      .mockResolvedValueOnce([folderNode1]);
    vi.spyOn(chrome.bookmarks, 'get').mockImplementation(get);

    const getChildren = vi
      .fn()
      .mockResolvedValueOnce(baseNode.children)
      .mockResolvedValueOnce(folderNode1.children);
    vi.spyOn(chrome.bookmarks, 'getChildren').mockImplementation(getChildren);

    // Call bookmark moved handler
    await bookmarksManager.handleBookmarkMoved(bookmarkNode3.id, moveInfo);

    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenNthCalledWith(1, baseNode.id);
    expect(get).toHaveBeenNthCalledWith(2, folderNode1.id);
    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenNthCalledWith(1, baseNode.id);
    expect(get).toHaveBeenNthCalledWith(2, folderNode1.id);

    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      3,
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[0].id).toBe(
      bookmarkNode3.id,
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[1].id).toBe(
      bookmarkNode1.id,
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[2].id).toBe(
      folderNode1.id,
    );
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(1);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode2.id,
    );
  });

  it('moved to child folder', async () => {
    expect(baseNode.id).toBe(bookmarkNode1.parentId);
    expect(baseNode.id).toBe(folderNode1.parentId);
    expect(folderNode1.id).toBe(bookmarkNode2.parentId);
    expect(folderNode1.id).toBe(bookmarkNode3.parentId);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[0].id).toBe(
      bookmarkNode1.id,
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[1].id).toBe(
      folderNode1.id,
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode2.id,
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode3.id,
    );
    const initialNodeStoreMapSize = nodeStoreMap.size;

    // Move bookmarkNode1 to folderNode1
    folderNode1.children!.unshift(baseNode.children!.shift()!);
    const moveInfo: Treetop.BookmarkMoveInfo = {
      parentId: folderNode1.id,
      index: 0,
      oldParentId: baseNode.id,
      oldIndex: 0,
    };

    const get = vi
      .fn()
      .mockResolvedValueOnce([folderNode1])
      .mockResolvedValueOnce([baseNode]);
    vi.spyOn(chrome.bookmarks, 'get').mockImplementation(get);

    const getChildren = vi
      .fn()
      .mockResolvedValueOnce(folderNode1.children)
      .mockResolvedValueOnce(baseNode.children);
    vi.spyOn(chrome.bookmarks, 'getChildren').mockImplementation(getChildren);

    // Call bookmark moved handler
    await bookmarksManager.handleBookmarkMoved(bookmarkNode1.id, moveInfo);

    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenNthCalledWith(1, folderNode1.id);
    expect(get).toHaveBeenNthCalledWith(2, baseNode.id);
    expect(get).toHaveBeenCalledTimes(2);
    expect(get).toHaveBeenNthCalledWith(1, folderNode1.id);
    expect(get).toHaveBeenNthCalledWith(2, baseNode.id);

    expect(nodeStoreMap.size).toBe(initialNodeStoreMapSize);
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children).toHaveLength(
      1,
    );
    expect(getFolderNode(nodeStoreMap.get(baseNode.id)).children[0].id).toBe(
      folderNode1.id,
    );
    expect(
      getFolderNode(nodeStoreMap.get(folderNode1.id)).children.length,
    ).toBe(3);
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[0].id).toBe(
      bookmarkNode1.id,
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[1].id).toBe(
      bookmarkNode2.id,
    );
    expect(getFolderNode(nodeStoreMap.get(folderNode1.id)).children[2].id).toBe(
      bookmarkNode3.id,
    );
  });
});
