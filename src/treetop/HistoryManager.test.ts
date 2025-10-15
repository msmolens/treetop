/* eslint no-irregular-whitespace: ["error", { "skipComments": true }] */
import { SvelteMap } from 'svelte/reactivity';
import { writable } from 'svelte/store';
import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HistoryManager } from '@Treetop/treetop/HistoryManager';
import * as Treetop from '@Treetop/treetop/types';

import {
  createBookmarkNode,
  createBrowserBookmarkNode,
  createBrowserFolderNode,
  createFolderNode,
  createHistoryItem,
  createOtherBookmarksNode,
  createVisitItem,
} from '../../test/utils/factories';

const getBookmarkNodes = (
  folder: Treetop.FolderNode,
): Treetop.BookmarkNode[] => {
  const bookmarkNodes = [];
  for (const child of folder.children) {
    if (child.type === Treetop.NodeType.Bookmark) {
      bookmarkNodes.push(child);
    }
  }
  return bookmarkNodes;
};

let folderNodeMap: Treetop.FolderNodeMap;
let lastVisitTimeMap: Treetop.LastVisitTimeMap;
let historyManager: HistoryManager;
let folderNode1: Treetop.FolderNode;
let folderNode2: Treetop.FolderNode;

beforeEach(() => {
  folderNodeMap = new Map() as Treetop.FolderNodeMap;
  lastVisitTimeMap = new SvelteMap();
  historyManager = new HistoryManager(lastVisitTimeMap);

  // Create node tree:
  // folderNode1
  //   ├── bookmarkNode
  //   ├── bookmarkNode
  //   ├── bookmarkNode
  //   ├── bookmarkNode
  //   └── folderNode2
  //      ├── bookmarkNode
  //      ├── bookmarkNode
  //      └── bookmarkNode

  folderNode1 = createFolderNode();
  for (let i = 0; i < 4; i++) {
    folderNode1.children.push(createBookmarkNode());
  }

  folderNode2 = createFolderNode();
  for (let i = 0; i < 3; i++) {
    folderNode2.children.push(createBookmarkNode());
  }
  folderNode1.children.push(folderNode2);

  folderNodeMap.set(folderNode1.id, writable(folderNode1));
  folderNodeMap.set(folderNode2.id, writable(folderNode2));
});

describe('init', () => {
  it('sets default last visit time for bookmarks', () => {
    historyManager.init(folderNodeMap);

    expect(lastVisitTimeMap.size).toBe(7);

    for (const lastVisitTime of lastVisitTimeMap.values()) {
      expect(lastVisitTime).toBe(0);
    }
  });
});

describe('loadHistory', () => {
  beforeEach(() => {
    historyManager.init(folderNodeMap);
  });

  it('sets last visit time of visited bookmarks', async () => {
    const getVisits = vi.fn();
    vi.spyOn(chrome.history, 'getVisits').mockImplementation(getVisits);

    const visitTimeMap = new Map<string, number>();

    const bookmarkNodes = [];
    bookmarkNodes.push(...getBookmarkNodes(folderNode1));
    bookmarkNodes.push(...getBookmarkNodes(folderNode2));
    // Bookmarks alternate between unvisited and visited
    bookmarkNodes.forEach((node, index) => {
      const visitItems = [];
      let visitTime = 0;
      if (index & 1) {
        const visitItem = createVisitItem();
        visitTime = visitItem.visitTime!;
        visitItems.push(visitItem);
      }
      visitTimeMap.set(node.id, visitTime);
      getVisits.mockResolvedValueOnce(visitItems);
    });

    await historyManager.loadHistory(folderNodeMap);

    expect(getVisits).toHaveBeenCalledTimes(7);
    expect(getVisits).toHaveBeenNthCalledWith(1, { url: bookmarkNodes[0].url });
    expect(getVisits).toHaveBeenNthCalledWith(2, { url: bookmarkNodes[1].url });
    expect(getVisits).toHaveBeenNthCalledWith(3, { url: bookmarkNodes[2].url });
    expect(getVisits).toHaveBeenNthCalledWith(4, { url: bookmarkNodes[3].url });
    expect(getVisits).toHaveBeenNthCalledWith(5, { url: bookmarkNodes[4].url });
    expect(getVisits).toHaveBeenNthCalledWith(6, { url: bookmarkNodes[5].url });
    expect(getVisits).toHaveBeenNthCalledWith(7, { url: bookmarkNodes[6].url });

    expect(lastVisitTimeMap.size).toBe(7);
    for (const [nodeId, lastVisitTime] of lastVisitTimeMap.entries()) {
      const visitTime = visitTimeMap.get(nodeId) ?? 0;
      expect(lastVisitTime).toBe(visitTime);
    }
  });

  it('no-op when called twice in a row', async () => {
    const getVisits = vi.fn();
    vi.spyOn(chrome.history, 'getVisits').mockImplementation(getVisits);

    const bookmarkNodes = [];
    bookmarkNodes.push(...getBookmarkNodes(folderNode1));
    bookmarkNodes.push(...getBookmarkNodes(folderNode2));
    bookmarkNodes.forEach((_node) => {
      const visitItems = [createVisitItem()];
      getVisits.mockResolvedValueOnce(visitItems);
    });

    await historyManager.loadHistory(folderNodeMap);
    await historyManager.loadHistory(folderNodeMap);

    expect(getVisits).toHaveBeenCalledTimes(7);
    expect(getVisits).toHaveBeenNthCalledWith(1, { url: bookmarkNodes[0].url });
    expect(getVisits).toHaveBeenNthCalledWith(2, { url: bookmarkNodes[1].url });
    expect(getVisits).toHaveBeenNthCalledWith(3, { url: bookmarkNodes[2].url });
    expect(getVisits).toHaveBeenNthCalledWith(4, { url: bookmarkNodes[3].url });
    expect(getVisits).toHaveBeenNthCalledWith(5, { url: bookmarkNodes[4].url });
    expect(getVisits).toHaveBeenNthCalledWith(6, { url: bookmarkNodes[5].url });
    expect(getVisits).toHaveBeenNthCalledWith(7, { url: bookmarkNodes[6].url });
  });
});

describe('unloadHistory', () => {
  it('resets all last visit times', () => {
    const nodeIds = [
      faker.string.uuid(),
      faker.string.uuid(),
      faker.string.uuid(),
    ];

    for (const nodeId of nodeIds) {
      lastVisitTimeMap.set(nodeId, faker.date.past().getTime());
    }

    historyManager.unloadHistory();

    for (const nodeId of nodeIds) {
      expect(lastVisitTimeMap.get(nodeId)!).toBe(0);
    }
  });
});

describe('handleBookmarkCreated', () => {
  it('sets default last visit time for a new unvisited bookmark', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);

    const getVisits = vi.fn().mockResolvedValue([]);
    vi.spyOn(chrome.history, 'getVisits').mockImplementation(getVisits);

    await historyManager.handleBookmarkCreated(bookmarkNode.id, bookmarkNode);

    expect(getVisits).toHaveBeenCalledOnce();
    expect(getVisits).toHaveBeenCalledWith({ url: bookmarkNode.url });

    expect(lastVisitTimeMap.has(bookmarkNode.id)).toBe(true);
    expect(lastVisitTimeMap.get(bookmarkNode.id)!).toBe(0);
  });

  it('sets last visit time for a new visited bookmark', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);

    const visitItem = createVisitItem();

    const getVisits = vi.fn().mockResolvedValue([visitItem]);
    vi.spyOn(chrome.history, 'getVisits').mockImplementation(getVisits);

    await historyManager.handleBookmarkCreated(bookmarkNode.id, bookmarkNode);

    expect(getVisits).toHaveBeenCalledOnce();
    expect(getVisits).toHaveBeenCalledWith({ url: bookmarkNode.url });

    expect(lastVisitTimeMap.has(bookmarkNode.id)).toBe(true);
    expect(lastVisitTimeMap.get(bookmarkNode.id)!).toBe(visitItem.visitTime!);
  });

  it('ignores new folders', async () => {
    const baseNode = createOtherBookmarksNode();
    const folderNode = createBrowserFolderNode(baseNode);

    await historyManager.handleBookmarkCreated(folderNode.id, folderNode);
  });
});

describe('handleBookmarkRemoved', () => {
  it('removes last visit time for a bookmark', () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode.id, 0);
    const initialSize = lastVisitTimeMap.size;

    historyManager.handleBookmarkRemoved(bookmarkNode.id);

    expect(lastVisitTimeMap.has(bookmarkNode.id)).toBe(false);
    expect(lastVisitTimeMap.size).toBe(initialSize - 1);
  });

  it('ignores folders', () => {
    const baseNode = createOtherBookmarksNode();
    const folderNode = createBrowserFolderNode(baseNode);
    const initialSize = lastVisitTimeMap.size;

    historyManager.handleBookmarkRemoved(folderNode.id);

    expect(lastVisitTimeMap.size).toBe(initialSize);
  });
});

describe('handleBookmarkChanged', () => {
  it('updates last visit time of a bookmark when its URL is visited', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode.id, 0);

    const newUrl = faker.internet.url();
    const changeInfo: Treetop.BookmarkChangeInfo = {
      title: bookmarkNode.title,
      url: newUrl,
    };

    const visitItem = createVisitItem();

    const getVisits = vi.fn().mockResolvedValue([visitItem]);
    vi.spyOn(chrome.history, 'getVisits').mockImplementation(getVisits);

    await historyManager.handleBookmarkChanged(bookmarkNode.id, changeInfo);

    expect(getVisits).toHaveBeenCalledOnce();
    expect(getVisits).toHaveBeenCalledWith({ url: newUrl });

    expect(lastVisitTimeMap.get(bookmarkNode.id)!).toBe(visitItem.visitTime!);
  });

  it('resets last visit time of a bookmark when its URL is not visited', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode.id, 0);

    const newUrl = faker.internet.url();
    const changeInfo: Treetop.BookmarkChangeInfo = {
      title: bookmarkNode.title,
      url: newUrl,
    };

    const getVisits = vi.fn().mockResolvedValue([]);
    vi.spyOn(chrome.history, 'getVisits').mockImplementation(getVisits);

    await historyManager.handleBookmarkChanged(bookmarkNode.id, changeInfo);

    expect(getVisits).toHaveBeenCalledOnce();
    expect(getVisits).toHaveBeenCalledWith({ url: newUrl });

    expect(lastVisitTimeMap.get(bookmarkNode.id)!).toBe(0);
  });

  it('ignores folders', async () => {
    const baseNode = createOtherBookmarksNode();
    const folderNode = createBrowserFolderNode(baseNode);
    const changeInfo: Treetop.BookmarkChangeInfo = {
      title: faker.word.words(),
    };

    await historyManager.handleBookmarkChanged(folderNode.id, changeInfo);
  });
});

describe('handleVisited', () => {
  it('updates last visit times when the user visits a bookmarked URL', async () => {
    const historyItem = createHistoryItem();
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode1 = createBrowserBookmarkNode(baseNode);
    const bookmarkNode2 = createBrowserBookmarkNode(baseNode);
    bookmarkNode1.url = historyItem.url!;
    bookmarkNode2.url = historyItem.url!;
    lastVisitTimeMap.set(bookmarkNode1.id, 0);
    lastVisitTimeMap.set(bookmarkNode2.id, 0);

    const search = vi.fn().mockResolvedValue([bookmarkNode1, bookmarkNode2]);
    vi.spyOn(chrome.bookmarks, 'search').mockImplementation(search);

    await historyManager.handleVisited(historyItem);

    expect(search).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledWith({ url: historyItem.url });

    expect(lastVisitTimeMap.get(bookmarkNode1.id)!).toBe(
      historyItem.lastVisitTime!,
    );
    expect(lastVisitTimeMap.get(bookmarkNode2.id)!).toBe(
      historyItem.lastVisitTime!,
    );
  });

  it("ignores visits to URLs that aren't bookmarked", async () => {
    const historyItem = createHistoryItem();
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode1 = createBrowserBookmarkNode(baseNode);
    const bookmarkNode2 = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode1.id, 0);
    lastVisitTimeMap.set(bookmarkNode2.id, 0);

    const search = vi.fn().mockResolvedValue([]);
    vi.spyOn(chrome.bookmarks, 'search').mockImplementation(search);

    await historyManager.handleVisited(historyItem);

    expect(search).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledWith({ url: historyItem.url });

    expect(lastVisitTimeMap.get(bookmarkNode1.id)!).toBe(0);
    expect(lastVisitTimeMap.get(bookmarkNode2.id)!).toBe(0);
  });
});

describe('handleVisitRemoved', () => {
  it('resets last visit time when a bookmarked URL is removed from history', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode.id, 1e6);

    const search = vi.fn().mockResolvedValue([bookmarkNode]);
    vi.spyOn(chrome.bookmarks, 'search').mockImplementation(search);

    const removeInfo: Treetop.HistoryRemovedResult = {
      allHistory: false,
      urls: [bookmarkNode.url!],
    };

    await historyManager.handleVisitRemoved(removeInfo);

    expect(search).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledWith({ url: bookmarkNode.url });

    expect(lastVisitTimeMap.get(bookmarkNode.id)!).toBe(0);
  });

  it('ignores when a non-bookmarked URL is removed from history', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode.id, 1e6);

    const url = faker.internet.url();

    const search = vi.fn().mockResolvedValue([]);
    vi.spyOn(chrome.bookmarks, 'search').mockImplementation(search);

    const removeInfo: Treetop.HistoryRemovedResult = {
      allHistory: false,
      urls: [url],
    };

    await historyManager.handleVisitRemoved(removeInfo);

    expect(search).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledWith({ url });

    expect(lastVisitTimeMap.get(bookmarkNode.id)!).toBe(1e6);
  });

  it('resets all last visit times when all history is removed', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode1 = createBrowserBookmarkNode(baseNode);
    const bookmarkNode2 = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode1.id, faker.date.past().getTime());
    lastVisitTimeMap.set(bookmarkNode2.id, faker.date.past().getTime());

    const removeInfo: Treetop.HistoryRemovedResult = {
      allHistory: true,
      urls: [],
    };

    await historyManager.handleVisitRemoved(removeInfo);

    expect(lastVisitTimeMap.get(bookmarkNode1.id)!).toBe(0);
    expect(lastVisitTimeMap.get(bookmarkNode2.id)!).toBe(0);
  });
});
