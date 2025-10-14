/* eslint no-irregular-whitespace: ["error", { "skipComments": true }] */

import { SvelteSet } from 'svelte/reactivity';
import { writable } from 'svelte/store';
import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it } from 'vitest';

import { FilterManager } from '@Treetop/treetop/FilterManager';
import type * as Treetop from '@Treetop/treetop/types';

import {
  createBookmarkNode,
  createBrowserBookmarkNode,
  createBrowserFolderNode,
  createFolderNode,
  createOtherBookmarksNode,
} from '../../test/utils/factories';

const NUM_RANDOM_WORDS = 3;

// Generate a random string that contains the specified string.
const randomStringContaining = (str: string) => {
  return `${faker.word.words(NUM_RANDOM_WORDS)}${str}${faker.word.words(
    NUM_RANDOM_WORDS,
  )}`;
};

let nodeStoreMap: Treetop.NodeStoreMap;
let filterSet: Treetop.FilterSet;
let filterManager: FilterManager;
let folderNode1: Treetop.FolderNode;
let folderNode2: Treetop.FolderNode;
let folderNode3: Treetop.FolderNode;
let folderNode4: Treetop.FolderNode;
let folderNode5: Treetop.FolderNode;
let folderNode6: Treetop.FolderNode;

beforeEach(() => {
  nodeStoreMap = new Map() as Treetop.NodeStoreMap;
  filterSet = new SvelteSet();
  filterManager = new FilterManager(filterSet, nodeStoreMap);

  // Create node tree:
  // folderNode1
  //   ├── bookmarkNode
  //   ├── bookmarkNode
  //   ├── bookmarkNode
  //   ├── folderNode2
  //   │  ├── bookmarkNode
  //   │  ├── bookmarkNode
  //   │  ├── bookmarkNode
  //   │  ├── folderNode3
  //   │  │  ├── bookmarkNode
  //   │  │  ├── bookmarkNode
  //   │  │  └── bookmarkNode
  //   │  └── folderNode4
  //   │     ├── bookmarkNode
  //   │     ├── bookmarkNode
  //   │     └── bookmarkNode
  //   └── folderNode5
  //      ├── bookmarkNode
  //      ├── bookmarkNode
  //      └── folderNode6
  //         ├── bookmarkNode
  //         └── bookmarkNode

  folderNode1 = createFolderNode({
    children: [
      createBookmarkNode(),
      createBookmarkNode(),
      createBookmarkNode(),
    ],
  });

  folderNode2 = createFolderNode({
    parentId: folderNode1.id,
    children: [
      createBookmarkNode(),
      createBookmarkNode(),
      createBookmarkNode(),
    ],
  });
  folderNode1.children.push(folderNode2);

  folderNode3 = createFolderNode({
    parentId: folderNode2.id,
    children: [
      createBookmarkNode(),
      createBookmarkNode(),
      createBookmarkNode(),
    ],
  });
  folderNode2.children.push(folderNode3);

  folderNode4 = createFolderNode({
    parentId: folderNode2.id,
    children: [
      createBookmarkNode(),
      createBookmarkNode(),
      createBookmarkNode(),
    ],
  });
  folderNode2.children.push(folderNode4);

  folderNode5 = createFolderNode({
    parentId: folderNode1.id,
    children: [createBookmarkNode(), createBookmarkNode()],
  });
  folderNode1.children.push(folderNode5);

  folderNode6 = createFolderNode({
    parentId: folderNode5.id,
    children: [createBookmarkNode(), createBookmarkNode()],
  });
  folderNode5.children.push(folderNode6);

  nodeStoreMap.set(folderNode1.id, writable(folderNode1));
  nodeStoreMap.set(folderNode2.id, writable(folderNode2));
  nodeStoreMap.set(folderNode3.id, writable(folderNode3));
  nodeStoreMap.set(folderNode4.id, writable(folderNode4));
  nodeStoreMap.set(folderNode5.id, writable(folderNode5));
  nodeStoreMap.set(folderNode6.id, writable(folderNode6));
});

describe('setFilter', () => {
  it('no matches', () => {
    filterManager.setFilter(faker.word.words(NUM_RANDOM_WORDS));

    expect(filterSet.size).toBe(0);
  });

  it('match in root folder', () => {
    const filter = (folderNode1.children[1] as Treetop.BookmarkNode).title;
    filterManager.setFilter(filter);

    expect(filterSet.size).toBe(2);
    expect(filterSet.has(folderNode1.id)).toBe(true);
    expect(filterSet.has(folderNode1.children[1].id)).toBe(true);
  });

  it('URL match in root folder', () => {
    const url = (folderNode1.children[1] as Treetop.BookmarkNode).url;
    const filter = new URL(url).hostname;
    filterManager.setFilter(filter);

    expect(filterSet.size).toBe(2);
    expect(filterSet.has(folderNode1.id)).toBe(true);
    expect(filterSet.has(folderNode1.children[1].id)).toBe(true);
  });

  it('multiple matches in root folder', () => {
    const filter = faker.word.words(NUM_RANDOM_WORDS);
    (folderNode1.children[0] as Treetop.BookmarkNode).title =
      randomStringContaining(filter);
    (folderNode1.children[1] as Treetop.BookmarkNode).title =
      randomStringContaining(filter);
    filterManager.setFilter(filter);

    expect(filterSet.size).toBe(3);
    expect(filterSet.has(folderNode1.id)).toBe(true);
    expect(filterSet.has(folderNode1.children[0].id)).toBe(true);
    expect(filterSet.has(folderNode1.children[1].id)).toBe(true);
  });

  it('match in root folder and in nested folder', () => {
    const filter = faker.word.words(NUM_RANDOM_WORDS);
    (folderNode1.children[1] as Treetop.BookmarkNode).title =
      randomStringContaining(filter);
    (folderNode2.children[1] as Treetop.BookmarkNode).title =
      randomStringContaining(filter);
    filterManager.setFilter(filter);

    expect(filterSet.size).toBe(4);
    expect(filterSet.has(folderNode1.id)).toBe(true);
    expect(filterSet.has(folderNode2.id)).toBe(true);
    expect(filterSet.has(folderNode1.children[1].id)).toBe(true);
    expect(filterSet.has(folderNode2.children[1].id)).toBe(true);
  });

  it('match in nested folder', () => {
    const filter = (folderNode2.children[1] as Treetop.BookmarkNode).title;
    filterManager.setFilter(filter);

    expect(filterSet.size).toBe(3);
    expect(filterSet.has(folderNode1.id)).toBe(true);
    expect(filterSet.has(folderNode2.id)).toBe(true);
    expect(filterSet.has(folderNode2.children[1].id)).toBe(true);
  });

  it('multiple matches in nested folder', () => {
    const filter = faker.word.words(NUM_RANDOM_WORDS);
    (folderNode2.children[0] as Treetop.BookmarkNode).title =
      randomStringContaining(filter);
    (folderNode2.children[1] as Treetop.BookmarkNode).title =
      randomStringContaining(filter);
    filterManager.setFilter(filter);

    expect(filterSet.size).toBe(4);
    expect(filterSet.has(folderNode1.id)).toBe(true);
    expect(filterSet.has(folderNode2.id)).toBe(true);
    expect(filterSet.has(folderNode2.children[0].id)).toBe(true);
    expect(filterSet.has(folderNode2.children[1].id)).toBe(true);
  });

  it('match in deeply nested folder', () => {
    const filter = (folderNode4.children[1] as Treetop.BookmarkNode).title;
    filterManager.setFilter(filter);

    expect(filterSet.size).toBe(4);
    expect(filterSet.has(folderNode1.id)).toBe(true);
    expect(filterSet.has(folderNode2.id)).toBe(true);
    expect(filterSet.has(folderNode4.id)).toBe(true);
    expect(filterSet.has(folderNode4.children[1].id)).toBe(true);
  });

  it('multiple matches in deeply nested folder', () => {
    const filter = faker.word.words(NUM_RANDOM_WORDS);
    (folderNode4.children[0] as Treetop.BookmarkNode).title =
      randomStringContaining(filter);
    (folderNode4.children[2] as Treetop.BookmarkNode).title =
      randomStringContaining(filter);
    filterManager.setFilter(filter);

    expect(filterSet.size).toBe(5);
    expect(filterSet.has(folderNode1.id)).toBe(true);
    expect(filterSet.has(folderNode2.id)).toBe(true);
    expect(filterSet.has(folderNode4.id)).toBe(true);
    expect(filterSet.has(folderNode4.children[0].id)).toBe(true);
    expect(filterSet.has(folderNode4.children[2].id)).toBe(true);
  });

  it('matches in multiple nested folders', () => {
    const filter = faker.word.words(NUM_RANDOM_WORDS);
    (folderNode2.children[0] as Treetop.BookmarkNode).title =
      randomStringContaining(filter);
    (folderNode6.children[0] as Treetop.BookmarkNode).title =
      randomStringContaining(filter);
    filterManager.setFilter(filter);

    expect(filterSet.size).toBe(6);
    expect(filterSet.has(folderNode1.id)).toBe(true);
    expect(filterSet.has(folderNode2.id)).toBe(true);
    expect(filterSet.has(folderNode5.id)).toBe(true);
    expect(filterSet.has(folderNode6.id)).toBe(true);
    expect(filterSet.has(folderNode2.children[0].id)).toBe(true);
    expect(filterSet.has(folderNode6.children[0].id)).toBe(true);
  });
});

describe('handleBookmarkCreated', () => {
  describe('when filter is set', () => {
    it('new matching bookmark in root folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      filterManager.setFilter(filter);

      const baseNode = createOtherBookmarksNode();
      baseNode.id = folderNode1.id;

      const bookmarkNode = createBrowserBookmarkNode(baseNode);
      bookmarkNode.title += filter;

      filterManager.handleBookmarkCreated(bookmarkNode.id, bookmarkNode);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(baseNode.id)).toBe(true);
      expect(filterSet.size).toBe(2);
    });

    it('new matching bookmark URL in root folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      filterManager.setFilter(filter);

      const baseNode = createOtherBookmarksNode();
      baseNode.id = folderNode1.id;

      const bookmarkNode = createBrowserBookmarkNode(baseNode);
      bookmarkNode.url! += filter;

      filterManager.handleBookmarkCreated(bookmarkNode.id, bookmarkNode);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(baseNode.id)).toBe(true);
      expect(filterSet.size).toBe(2);
    });

    it('new non-matching bookmark in root folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      filterManager.setFilter(filter);

      const baseNode = createOtherBookmarksNode();
      baseNode.id = folderNode1.id;

      const bookmarkNode = createBrowserBookmarkNode(baseNode);

      filterManager.handleBookmarkCreated(bookmarkNode.id, bookmarkNode);

      expect(filterSet.size).toBe(0);
    });

    it('new matching bookmark in nested folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      filterManager.setFilter(filter);

      const baseNode = createOtherBookmarksNode();
      baseNode.id = folderNode1.id;

      const folderNode = createBrowserFolderNode(baseNode);
      folderNode.id = folderNode2.id;

      const bookmarkNode = createBrowserBookmarkNode(folderNode);
      bookmarkNode.title += filter;

      filterManager.handleBookmarkCreated(bookmarkNode.id, bookmarkNode);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode.id)).toBe(true);
      expect(filterSet.has(baseNode.id)).toBe(true);
      expect(filterSet.size).toBe(3);
    });

    it('new non-matching bookmark in nested folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      filterManager.setFilter(filter);

      const baseNode = createOtherBookmarksNode();
      baseNode.id = folderNode1.id;

      const folderNode = createBrowserFolderNode(baseNode);
      folderNode.id = folderNode2.id;

      const bookmarkNode = createBrowserBookmarkNode(folderNode);

      filterManager.handleBookmarkCreated(bookmarkNode.id, bookmarkNode);

      expect(filterSet.size).toBe(0);
    });

    it('ignores new folders', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      filterManager.setFilter(filter);

      const baseNode = createOtherBookmarksNode();
      const folderNode = createBrowserFolderNode(baseNode);
      folderNode.title = filter;

      filterManager.handleBookmarkCreated(folderNode.id, folderNode);

      expect(filterSet.size).toBe(0);
    });
  });

  describe('when filter is not set', () => {
    it('ignores new bookmarks', () => {
      const baseNode = createOtherBookmarksNode();
      const bookmarkNode = createBrowserBookmarkNode(baseNode);

      filterManager.handleBookmarkCreated(bookmarkNode.id, bookmarkNode);

      expect(filterSet.size).toBe(0);
    });

    it('ignores new folders', () => {
      const baseNode = createOtherBookmarksNode();
      const folderNode = createBrowserFolderNode(baseNode);

      filterManager.handleBookmarkCreated(folderNode.id, folderNode);

      expect(filterSet.size).toBe(0);
    });
  });
});

describe('handleBookmarkRemoved', () => {
  describe('when filter is set', () => {
    it('removed matching bookmark in root folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode1.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.size).toBe(2);

      folderNode1.children = folderNode1.children.filter(
        (child) => child.id !== bookmarkNode.id,
      );

      filterManager.handleBookmarkRemoved(bookmarkNode.id);

      expect(filterSet.size).toBe(0);
    });

    it('removed matching bookmark in root folder when sibling bookmark matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode1.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode1.children[1] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.size).toBe(3);

      folderNode1.children = folderNode1.children.filter(
        (child) => child.id !== bookmarkNode1.id,
      );

      filterManager.handleBookmarkRemoved(bookmarkNode1.id);

      expect(filterSet.has(bookmarkNode1.id)).toBe(false);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.size).toBe(2);
    });

    it('removed matching bookmark in root folder when nested bookmark matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode1.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode2.children[0] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      folderNode1.children = folderNode1.children.filter(
        (child) => child.id !== bookmarkNode1.id,
      );

      filterManager.handleBookmarkRemoved(bookmarkNode1.id);

      expect(filterSet.has(bookmarkNode1.id)).toBe(false);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);
    });

    it('removed matching bookmark in nested folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode3.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      folderNode3.children = folderNode3.children.filter(
        (child) => child.id !== bookmarkNode.id,
      );

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      filterManager.handleBookmarkRemoved(bookmarkNode.id);

      expect(filterSet.size).toBe(0);
    });

    it('removed matching bookmark in nested folder when sibling bookmark matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode2.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode2.children[1] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      folderNode2.children = folderNode2.children.filter(
        (child) => child.id !== bookmarkNode1.id,
      );

      filterManager.handleBookmarkRemoved(bookmarkNode1.id);

      expect(filterSet.has(bookmarkNode1.id)).toBe(false);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);
    });

    it('removed matching bookmark in nested folder when nested bookmark matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode2.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode3.children[0] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(5);

      folderNode2.children = folderNode2.children.filter(
        (child) => child.id !== bookmarkNode1.id,
      );

      filterManager.handleBookmarkRemoved(bookmarkNode1.id);

      expect(filterSet.has(bookmarkNode1.id)).toBe(false);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(4);
    });

    it('removed non-matching bookmark in root folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode1.children[0] as Treetop.BookmarkNode;
      filterManager.setFilter(filter);

      expect(filterSet.size).toBe(0);

      folderNode1.children = folderNode1.children.filter(
        (child) => child.id !== bookmarkNode.id,
      );

      filterManager.handleBookmarkRemoved(bookmarkNode.id);

      expect(filterSet.size).toBe(0);
    });

    it('removed non-matching bookmark in nested folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode2.children[0] as Treetop.BookmarkNode;
      filterManager.setFilter(filter);

      expect(filterSet.size).toBe(0);

      folderNode2.children = folderNode2.children.filter(
        (child) => child.id !== bookmarkNode.id,
      );

      filterManager.handleBookmarkRemoved(bookmarkNode.id);

      expect(filterSet.size).toBe(0);
    });

    it('removed folder containing a matching bookmark', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode4.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode4.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      const removedNodeIds = [
        folderNode4.id,
        ...folderNode4.children.map((node) => node.id),
      ];
      folderNode4.children = [];

      filterManager.beginBatchRemove();
      removedNodeIds.forEach((nodeId) => {
        filterManager.handleBookmarkRemoved(nodeId);
      });
      filterManager.endBatchRemove();

      expect(filterSet.size).toBe(0);
    });

    it('removed folder not containing a matching bookmark', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      filterManager.setFilter(filter);

      expect(filterSet.size).toBe(0);

      const removedNodeIds = [
        folderNode4.id,
        ...folderNode4.children.map((node) => node.id),
      ];
      folderNode4.children = [];

      filterManager.beginBatchRemove();
      removedNodeIds.forEach((nodeId) => {
        filterManager.handleBookmarkRemoved(nodeId);
      });
      filterManager.endBatchRemove();

      expect(filterSet.size).toBe(0);
    });
  });

  describe('when filter is not set', () => {
    it('ignores bookmarks', () => {
      const baseNode = createOtherBookmarksNode();
      const bookmarkNode = createBrowserBookmarkNode(baseNode);
      filterManager.handleBookmarkRemoved(bookmarkNode.id);

      expect(filterSet.size).toBe(0);
    });

    it('ignores folders', () => {
      const baseNode = createOtherBookmarksNode();
      const folderNode = createBrowserFolderNode(baseNode);
      filterManager.handleBookmarkRemoved(folderNode.id);

      expect(filterSet.size).toBe(0);
    });
  });
});

describe('handleBookmarkChanged', () => {
  describe('when filter is set', () => {
    it('non-matching bookmark title now matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      filterManager.setFilter(filter);

      expect(filterSet.size).toBe(0);

      const bookmarkNode = folderNode2.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;

      const changeInfo: Treetop.BookmarkChangeInfo = {
        title: bookmarkNode.title,
      };
      filterManager.handleBookmarkChanged(bookmarkNode.id, changeInfo);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);
    });

    it('non-matching bookmark URL now matches', () => {
      const filter = faker.string.alphanumeric(8);
      filterManager.setFilter(filter);

      expect(filterSet.size).toBe(0);

      const bookmarkNode = folderNode2.children[0] as Treetop.BookmarkNode;
      bookmarkNode.url += filter;

      const changeInfo: Treetop.BookmarkChangeInfo = {
        title: bookmarkNode.title,
        url: bookmarkNode.url,
      };
      filterManager.handleBookmarkChanged(bookmarkNode.id, changeInfo);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);
    });

    it('non-matching bookmark title now matches when sibling matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode2.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode2.children[1] as Treetop.BookmarkNode;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(false);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);

      bookmarkNode1.title += filter;

      const changeInfo: Treetop.BookmarkChangeInfo = {
        title: bookmarkNode1.title,
      };
      filterManager.handleBookmarkChanged(bookmarkNode1.id, changeInfo);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(4);
    });

    it('non-matching bookmark title now matches when nested bookmark matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode2.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode3.children[1] as Treetop.BookmarkNode;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(false);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      bookmarkNode1.title += filter;

      const changeInfo: Treetop.BookmarkChangeInfo = {
        title: bookmarkNode1.title,
      };
      filterManager.handleBookmarkChanged(bookmarkNode1.id, changeInfo);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(5);
    });

    it('previously matching bookmark title no longer matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode2.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);

      bookmarkNode.title = bookmarkNode.title.replace(
        filter,
        faker.word.sample(),
      );

      const changeInfo: Treetop.BookmarkChangeInfo = {
        title: bookmarkNode.title,
      };
      filterManager.handleBookmarkChanged(bookmarkNode.id, changeInfo);

      expect(filterSet.size).toBe(0);
    });

    it('previously matching bookmark URL no longer matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode2.children[0] as Treetop.BookmarkNode;
      bookmarkNode.url += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);

      bookmarkNode.url = bookmarkNode.url.replace(filter, faker.word.sample());

      const changeInfo: Treetop.BookmarkChangeInfo = {
        title: bookmarkNode.title,
        url: bookmarkNode.url,
      };
      filterManager.handleBookmarkChanged(bookmarkNode.id, changeInfo);

      expect(filterSet.size).toBe(0);
    });

    it('previously matching bookmark no longer matches when sibling matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode2.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode2.children[1] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      bookmarkNode1.title = bookmarkNode1.title.replace(
        filter,
        faker.word.sample(),
      );

      const changeInfo: Treetop.BookmarkChangeInfo = {
        title: bookmarkNode1.title,
      };
      filterManager.handleBookmarkChanged(bookmarkNode1.id, changeInfo);

      expect(filterSet.has(bookmarkNode1.id)).toBe(false);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);
    });

    it('previously matching bookmark no longer matches when nested bookmark matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode2.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode3.children[0] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(5);

      bookmarkNode1.title = bookmarkNode1.title.replace(
        filter,
        faker.word.sample(),
      );

      const changeInfo: Treetop.BookmarkChangeInfo = {
        title: bookmarkNode1.title,
      };
      filterManager.handleBookmarkChanged(bookmarkNode1.id, changeInfo);

      expect(filterSet.has(bookmarkNode1.id)).toBe(false);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(4);
    });
  });

  describe('when filter is not set', () => {
    it('ignores bookmarks', () => {
      const bookmarkNode = folderNode1.children[0] as Treetop.BookmarkNode;
      const changeInfo: Treetop.BookmarkChangeInfo = {
        title: faker.word.words(),
      };
      filterManager.handleBookmarkChanged(bookmarkNode.id, changeInfo);

      expect(filterSet.size).toBe(0);
    });

    it('ignores folders', () => {
      const changeInfo: Treetop.BookmarkChangeInfo = {
        title: faker.word.words(),
      };
      filterManager.handleBookmarkChanged(folderNode2.id, changeInfo);

      expect(filterSet.size).toBe(0);
    });
  });
});

describe('handleBookmarkMoved', () => {
  describe('when filter is set', () => {
    it('moved within folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode2.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode2.children[1] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      // Move bookmarkNode2 to index 0
      const children = folderNode2.children;
      [children[0], children[1]] = [children[1], children[0]];

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: bookmarkNode2.parentId!,
        index: 0,
        oldParentId: bookmarkNode2.parentId!,
        oldIndex: 1,
      };

      filterManager.handleBookmarkMoved(bookmarkNode2.id, moveInfo);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(4);
    });

    it('moved to parent folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode3.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      // Move bookmarkNode to parent folder
      folderNode2.children.unshift(bookmarkNode);
      folderNode3.children = folderNode3.children.filter(
        (node) => node.id !== bookmarkNode.id,
      );

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode3.id,
        index: 0,
        oldParentId: folderNode2.id,
        oldIndex: 0,
      };

      filterManager.handleBookmarkMoved(bookmarkNode.id, moveInfo);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);
    });

    it('moved to parent folder when sibling matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode3.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode3.children[1] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(5);

      // Move bookmarkNode2 to parent folder
      folderNode2.children.unshift(bookmarkNode2);
      folderNode3.children = folderNode3.children.filter(
        (node) => node.id !== bookmarkNode2.id,
      );

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode3.id,
        index: 0,
        oldParentId: folderNode2.id,
        oldIndex: 1,
      };

      filterManager.handleBookmarkMoved(bookmarkNode2.id, moveInfo);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(5);
    });

    it('moved to child folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode2.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);

      // Move bookmarkNode to child folder
      folderNode4.children.unshift(bookmarkNode);
      folderNode2.children = folderNode2.children.filter(
        (node) => node.id !== bookmarkNode.id,
      );

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode4.id,
        index: 0,
        oldParentId: folderNode2.id,
        oldIndex: 0,
      };

      filterManager.handleBookmarkMoved(bookmarkNode.id, moveInfo);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode4.id)).toBe(true);
      expect(filterSet.size).toBe(4);
    });

    it('moved to child folder when sibling matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode2.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode2.children[1] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      // Move bookmarkNode2 to child folder
      folderNode4.children.unshift(bookmarkNode2);
      folderNode2.children = folderNode2.children.filter(
        (node) => node.id !== bookmarkNode2.id,
      );

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode4.id,
        index: 0,
        oldParentId: folderNode2.id,
        oldIndex: 1,
      };

      filterManager.handleBookmarkMoved(bookmarkNode2.id, moveInfo);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode4.id)).toBe(true);
      expect(filterSet.size).toBe(5);
    });

    it('moved to sibling folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode2.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);

      // Move bookmarkNode to sibling folder
      folderNode5.children.unshift(bookmarkNode);
      folderNode2.children = folderNode2.children.filter(
        (node) => node.id !== bookmarkNode.id,
      );

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode5.id,
        index: 0,
        oldParentId: folderNode2.id,
        oldIndex: 0,
      };

      filterManager.handleBookmarkMoved(bookmarkNode.id, moveInfo);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode5.id)).toBe(true);
      expect(filterSet.size).toBe(3);
    });

    it('moved to sibling folder when sibling matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode2.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode2.children[1] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      // Move bookmarkNode2 to sibling folder
      folderNode5.children.unshift(bookmarkNode2);
      folderNode2.children = folderNode2.children.filter(
        (node) => node.id !== bookmarkNode2.id,
      );

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode5.id,
        index: 0,
        oldParentId: folderNode2.id,
        oldIndex: 0,
      };

      filterManager.handleBookmarkMoved(bookmarkNode2.id, moveInfo);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode5.id)).toBe(true);
      expect(filterSet.size).toBe(5);
    });

    it('moved to distant folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode3.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      // Move bookmarkNode to distant folder
      folderNode6.children.unshift(bookmarkNode);
      folderNode3.children = folderNode3.children.filter(
        (node) => node.id !== bookmarkNode.id,
      );

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode6.id,
        index: 0,
        oldParentId: folderNode3.id,
        oldIndex: 0,
      };

      filterManager.handleBookmarkMoved(bookmarkNode.id, moveInfo);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode5.id)).toBe(true);
      expect(filterSet.has(folderNode6.id)).toBe(true);
      expect(filterSet.size).toBe(4);
    });

    it('moved to distant folder when sibling matches', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode1 = folderNode3.children[0] as Treetop.BookmarkNode;
      const bookmarkNode2 = folderNode3.children[1] as Treetop.BookmarkNode;
      bookmarkNode1.title += filter;
      bookmarkNode2.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(5);

      // Move bookmarkNode2 to distant folder
      folderNode6.children.unshift(bookmarkNode2);
      folderNode3.children = folderNode3.children.filter(
        (node) => node.id !== bookmarkNode2.id,
      );

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode6.id,
        index: 0,
        oldParentId: folderNode3.id,
        oldIndex: 0,
      };

      filterManager.handleBookmarkMoved(bookmarkNode2.id, moveInfo);

      expect(filterSet.has(bookmarkNode1.id)).toBe(true);
      expect(filterSet.has(bookmarkNode2.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.has(folderNode5.id)).toBe(true);
      expect(filterSet.has(folderNode6.id)).toBe(true);
      expect(filterSet.size).toBe(7);
    });

    it('folder moved within folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode2.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);

      // Move folderNode2 within folderNode1
      expect(folderNode2.parentId!).toBe(folderNode1.id);
      const oldIndex = folderNode1.children.findIndex(
        (node) => node.id === folderNode2.id,
      );
      expect(oldIndex).toBe(3);
      const newIndex = folderNode1.children.length - 1;

      const children = folderNode1.children;
      [children[oldIndex], children[newIndex]] = [
        children[newIndex],
        children[oldIndex],
      ];

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode1.id,
        index: newIndex,
        oldParentId: folderNode1.id,
        oldIndex,
      };

      filterManager.handleBookmarkMoved(folderNode2.id, moveInfo);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.size).toBe(3);
    });

    it('folder moved to a parent folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode3.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      // Move folderNode3 to folderNode1
      expect(folderNode3.parentId!).toBe(folderNode2.id);
      const oldIndex = folderNode2.children.findIndex(
        (node) => node.id === folderNode3.id,
      );
      expect(oldIndex).toBe(3);
      const newIndex = folderNode1.children.length - 1;

      folderNode2.children = folderNode2.children.filter(
        (node) => node.id !== folderNode3.id,
      );
      folderNode3.parentId = folderNode1.id;
      folderNode1.children.push(folderNode3);

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode1.id,
        index: newIndex,
        oldParentId: folderNode2.id,
        oldIndex: oldIndex,
      };

      filterManager.handleBookmarkMoved(folderNode3.id, moveInfo);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(3);
    });

    it('folder moved to a distant folder', () => {
      const filter = faker.word.words(NUM_RANDOM_WORDS);
      const bookmarkNode = folderNode3.children[0] as Treetop.BookmarkNode;
      bookmarkNode.title += filter;
      filterManager.setFilter(filter);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode2.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.size).toBe(4);

      // Move folderNode3 to folderNode5
      expect(folderNode3.parentId!).toBe(folderNode2.id);
      const oldIndex = folderNode2.children.findIndex(
        (node) => node.id === folderNode3.id,
      );
      expect(oldIndex).toBe(3);
      const newIndex = folderNode5.children.length - 1;

      folderNode2.children = folderNode2.children.filter(
        (node) => node.id !== folderNode3.id,
      );
      folderNode3.parentId = folderNode5.id;
      folderNode5.children.push(folderNode3);

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode5.id,
        index: newIndex,
        oldParentId: folderNode2.id,
        oldIndex: oldIndex,
      };

      filterManager.handleBookmarkMoved(folderNode3.id, moveInfo);

      expect(filterSet.has(bookmarkNode.id)).toBe(true);
      expect(filterSet.has(folderNode1.id)).toBe(true);
      expect(filterSet.has(folderNode3.id)).toBe(true);
      expect(filterSet.has(folderNode5.id)).toBe(true);
      expect(filterSet.size).toBe(4);
    });
  });

  describe('when filter is not set', () => {
    it('ignores bookmarks', () => {
      const bookmarkNode = folderNode2.children[1] as Treetop.BookmarkNode;

      // Move bookmarkNode to index 0
      const children = folderNode2.children;
      [children[0], children[1]] = [children[1], children[0]];

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: bookmarkNode.parentId!,
        index: 0,
        oldParentId: bookmarkNode.parentId!,
        oldIndex: 1,
      };

      filterManager.handleBookmarkMoved(bookmarkNode.id, moveInfo);

      expect(filterSet.size).toBe(0);
    });

    it('ignores folders', () => {
      // Move folderNode2 within folderNode1
      expect(folderNode2.parentId!).toBe(folderNode1.id);
      const oldIndex = folderNode1.children.findIndex(
        (node) => node.id === folderNode2.id,
      );
      expect(oldIndex).toBe(3);
      const newIndex = folderNode1.children.length - 1;

      const children = folderNode1.children;
      [children[oldIndex], children[newIndex]] = [
        children[newIndex],
        children[oldIndex],
      ];

      const moveInfo: Treetop.BookmarkMoveInfo = {
        parentId: folderNode1.id,
        index: newIndex,
        oldParentId: folderNode1.id,
        oldIndex,
      };

      filterManager.handleBookmarkMoved(folderNode2.id, moveInfo);

      expect(filterSet.size).toBe(0);
    });
  });
});
