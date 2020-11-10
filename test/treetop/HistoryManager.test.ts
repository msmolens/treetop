/* eslint no-irregular-whitespace: ["error", { "skipComments": true }] */
import { get, writable } from 'svelte/store';
import faker from 'faker';

import { HistoryManager } from '@Treetop/treetop/HistoryManager';
import * as Treetop from '@Treetop/treetop/types';

import {
  createBookmarkNode,
  createBrowserBookmarkNode,
  createBrowserFolderNode,
  createBrowserSeparatorNode,
  createFolderNode,
  createHistoryItem,
  createOtherBookmarksNode,
  createSeparatorNode,
  createVisitItem,
} from '../utils/factories';

const getBookmarkNodes = (
  folder: Treetop.FolderNode
): Treetop.BookmarkNode[] => {
  const bookmarkNodes = [];
  for (const child of folder.children) {
    if (child.type === Treetop.NodeType.Bookmark) {
      bookmarkNodes.push(child);
    }
  }
  return bookmarkNodes;
};

let nodeStoreMap: Treetop.NodeStoreMap;
let lastVisitTimeMap: Treetop.LastVisitTimeMap;
let historyManager: HistoryManager;
let folderNode1: Treetop.FolderNode;
let folderNode2: Treetop.FolderNode;

beforeEach(() => {
  nodeStoreMap = new Map() as Treetop.NodeStoreMap;
  lastVisitTimeMap = new Map() as Treetop.LastVisitTimeMap;
  historyManager = new HistoryManager(lastVisitTimeMap);

  // Create node tree:
  // folderNode1
  //   ├── bookmarkNode
  //   ├── bookmarkNode
  //   ├── bookmarkNode
  //   ├── separatorNode
  //   ├── bookmarkNode
  //   └── folderNode2
  //      ├── bookmarkNode
  //      ├── bookmarkNode
  //      └── bookmarkNode

  folderNode1 = createFolderNode();
  for (let i = 0; i < 3; i++) {
    folderNode1.children.push(createBookmarkNode());
  }
  folderNode1.children.push(createSeparatorNode());
  folderNode1.children.push(createBookmarkNode());

  folderNode2 = createFolderNode();
  for (let i = 0; i < 3; i++) {
    folderNode2.children.push(createBookmarkNode());
  }
  folderNode1.children.push(folderNode2);

  nodeStoreMap.set(folderNode1.id, writable(folderNode1));
  nodeStoreMap.set(folderNode2.id, writable(folderNode2));
});

describe('init', () => {
  it('sets default last visit time for bookmarks', () => {
    historyManager.init(nodeStoreMap);

    expect(lastVisitTimeMap.size).toBe(7);

    for (const lastVisitTimeStore of lastVisitTimeMap.values()) {
      expect(get(lastVisitTimeStore)).toBe(0);
    }
  });
});

describe('loadHistory', () => {
  beforeEach(() => {
    historyManager.init(nodeStoreMap);
  });

  it('sets last visit time of visited bookmarks', async () => {
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
      mockBrowser.history.getVisits
        .expect({ url: node.url })
        .andResolve(visitItems);
    });

    await historyManager.loadHistory(nodeStoreMap);

    expect(lastVisitTimeMap.size).toBe(7);
    for (const [nodeId, lastVisitTimeStore] of lastVisitTimeMap.entries()) {
      const visitTime = visitTimeMap.get(nodeId) ?? 0;
      expect(get(lastVisitTimeStore)).toBe(visitTime);
    }
  });

  it('no-op when called twice in a row', async () => {
    const bookmarkNodes = [];
    bookmarkNodes.push(...getBookmarkNodes(folderNode1));
    bookmarkNodes.push(...getBookmarkNodes(folderNode2));
    bookmarkNodes.forEach((node) => {
      const visitItems = [createVisitItem()];
      mockBrowser.history.getVisits
        .expect({ url: node.url })
        .andResolve(visitItems);
    });

    await historyManager.loadHistory(nodeStoreMap);
    await historyManager.loadHistory(nodeStoreMap);
  });
});

describe('unloadHistory', () => {
  it('resets all last visit times', () => {
    const nodeIds = [
      faker.random.uuid(),
      faker.random.uuid(),
      faker.random.uuid(),
    ];

    for (const nodeId of nodeIds) {
      lastVisitTimeMap.set(nodeId, writable(faker.random.number()));
    }

    historyManager.unloadHistory();

    for (const nodeId of nodeIds) {
      expect(get(lastVisitTimeMap.get(nodeId)!)).toBe(0);
    }
  });
});

describe('handleBookmarkCreated', () => {
  it('sets default last visit time for a new unvisited bookmark', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);

    mockBrowser.history.getVisits
      .expect({ url: bookmarkNode.url! })
      .andResolve([]);

    await historyManager.handleBookmarkCreated(bookmarkNode.id, bookmarkNode);

    expect(lastVisitTimeMap.has(bookmarkNode.id)).toBe(true);
    expect(get(lastVisitTimeMap.get(bookmarkNode.id)!)).toBe(0);
  });

  it('sets last visit time for a new visited bookmark', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);

    const visitItem = createVisitItem();
    mockBrowser.history.getVisits
      .expect({ url: bookmarkNode.url! })
      .andResolve([visitItem]);

    await historyManager.handleBookmarkCreated(bookmarkNode.id, bookmarkNode);

    expect(lastVisitTimeMap.has(bookmarkNode.id)).toBe(true);
    expect(get(lastVisitTimeMap.get(bookmarkNode.id)!)).toBe(
      visitItem.visitTime!
    );
  });

  it('ignores new folders', async () => {
    const baseNode = createOtherBookmarksNode();
    const folderNode = createBrowserFolderNode(baseNode);

    await historyManager.handleBookmarkCreated(folderNode.id, folderNode);
  });

  it('ignores new separators', async () => {
    const baseNode = createOtherBookmarksNode();
    const separatorNode = createBrowserSeparatorNode(baseNode);

    await historyManager.handleBookmarkCreated(separatorNode.id, separatorNode);
  });
});

describe('handleBookmarkRemoved', () => {
  it('removes last visit time for a bookmark', () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode.id, writable(0));
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

  it('ignores separators', () => {
    const baseNode = createOtherBookmarksNode();
    const separatorNode = createBrowserSeparatorNode(baseNode);
    const initialSize = lastVisitTimeMap.size;

    historyManager.handleBookmarkRemoved(separatorNode.id);

    expect(lastVisitTimeMap.size).toBe(initialSize);
  });
});

describe('handleBookmarkChanged', () => {
  it('updates last visit time of a bookmark when its URL is visited', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode.id, writable(0));

    const newUrl = faker.internet.url();
    const changeInfo: browser.bookmarks._OnChangedChangeInfo = {
      title: bookmarkNode.title,
      url: newUrl,
    };

    const visitItem = createVisitItem();
    mockBrowser.history.getVisits
      .expect({ url: newUrl })
      .andResolve([visitItem]);

    await historyManager.handleBookmarkChanged(bookmarkNode.id, changeInfo);

    expect(get(lastVisitTimeMap.get(bookmarkNode.id)!)).toBe(
      visitItem.visitTime!
    );
  });

  it('resets last visit time of a bookmark when its URL is not visited', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode.id, writable(0));

    const newUrl = faker.internet.url();
    const changeInfo: browser.bookmarks._OnChangedChangeInfo = {
      title: bookmarkNode.title,
      url: newUrl,
    };

    mockBrowser.history.getVisits.expect({ url: newUrl }).andResolve([]);

    await historyManager.handleBookmarkChanged(bookmarkNode.id, changeInfo);

    expect(get(lastVisitTimeMap.get(bookmarkNode.id)!)).toBe(0);
  });

  it('ignores folders', async () => {
    const baseNode = createOtherBookmarksNode();
    const folderNode = createBrowserFolderNode(baseNode);
    const changeInfo: browser.bookmarks._OnChangedChangeInfo = {
      title: faker.random.words(),
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
    lastVisitTimeMap.set(bookmarkNode1.id, writable(0));
    lastVisitTimeMap.set(bookmarkNode2.id, writable(0));

    mockBrowser.bookmarks.search
      .expect({ url: historyItem.url })
      .andResolve([bookmarkNode1, bookmarkNode2]);

    await historyManager.handleVisited(historyItem);

    expect(get(lastVisitTimeMap.get(bookmarkNode1.id)!)).toBe(
      historyItem.lastVisitTime!
    );
    expect(get(lastVisitTimeMap.get(bookmarkNode2.id)!)).toBe(
      historyItem.lastVisitTime!
    );
  });

  it("ignores visits to URLs that aren't bookmarked", async () => {
    const historyItem = createHistoryItem();
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode1 = createBrowserBookmarkNode(baseNode);
    const bookmarkNode2 = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode1.id, writable(0));
    lastVisitTimeMap.set(bookmarkNode2.id, writable(0));

    mockBrowser.bookmarks.search
      .expect({ url: historyItem.url })
      .andResolve([]);

    await historyManager.handleVisited(historyItem);

    expect(get(lastVisitTimeMap.get(bookmarkNode1.id)!)).toBe(0);
    expect(get(lastVisitTimeMap.get(bookmarkNode2.id)!)).toBe(0);
  });
});

describe('handleVisitRemoved', () => {
  it('resets last visit time when a bookmarked URL is removed from history', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode.id, writable(1e6));

    mockBrowser.bookmarks.search
      .expect({ url: bookmarkNode.url! })
      .andResolve([bookmarkNode]);

    const removeInfo: browser.history._OnVisitRemovedRemoved = {
      allHistory: false,
      urls: [bookmarkNode.url!],
    };

    await historyManager.handleVisitRemoved(removeInfo);

    expect(get(lastVisitTimeMap.get(bookmarkNode.id)!)).toBe(0);
  });

  it('ignores when a non-bookmarked URL is removed from history', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode.id, writable(1e6));

    const url = faker.internet.url();
    mockBrowser.bookmarks.search.expect({ url }).andResolve([]);

    const removeInfo: browser.history._OnVisitRemovedRemoved = {
      allHistory: false,
      urls: [url],
    };

    await historyManager.handleVisitRemoved(removeInfo);

    expect(get(lastVisitTimeMap.get(bookmarkNode.id)!)).toBe(1e6);
  });

  it('resets all last visit times when all history is removed', async () => {
    const baseNode = createOtherBookmarksNode();
    const bookmarkNode1 = createBrowserBookmarkNode(baseNode);
    const bookmarkNode2 = createBrowserBookmarkNode(baseNode);
    lastVisitTimeMap.set(bookmarkNode1.id, writable(faker.random.number()));
    lastVisitTimeMap.set(bookmarkNode2.id, writable(faker.random.number()));

    const removeInfo: browser.history._OnVisitRemovedRemoved = {
      allHistory: true,
      urls: [],
    };

    await historyManager.handleVisitRemoved(removeInfo);

    expect(get(lastVisitTimeMap.get(bookmarkNode1.id)!)).toBe(0);
    expect(get(lastVisitTimeMap.get(bookmarkNode2.id)!)).toBe(0);
  });
});
