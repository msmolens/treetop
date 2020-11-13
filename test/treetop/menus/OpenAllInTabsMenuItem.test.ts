import { writable } from 'svelte/store';
import faker from 'faker';

import { BOOKMARKS_ROOT_GUID } from '@Treetop/treetop/constants';
import type { OnClickedCallback } from '@Treetop/treetop/menus/MenuItem';
import { OpenAllInTabsMenuItem } from '@Treetop/treetop/menus/OpenAllInTabsMenuItem';
import type * as Treetop from '@Treetop/treetop/types';

import { createBookmarkNode, createFolderNode } from '../../utils/factories';

let menuItem: OpenAllInTabsMenuItem;
let nodeStoreMap: Treetop.NodeStoreMap;

beforeEach(() => {
  nodeStoreMap = new Map() as Treetop.NodeStoreMap;

  const callback: OnClickedCallback = (nodeId) => {
    void nodeId;
  };

  menuItem = new OpenAllInTabsMenuItem(nodeStoreMap, callback);
});

it('is disabled for the bookmarks root', () => {
  expect(menuItem.enabled(BOOKMARKS_ROOT_GUID)).toBe(false);
});

it('is disabled for bookmarks', () => {
  const nodeId = faker.random.alphaNumeric(8);
  expect(menuItem.enabled(nodeId)).toBe(false);
});

describe('folders', () => {
  let folderNode: Treetop.FolderNode;

  beforeEach(() => {
    folderNode = createFolderNode();
    nodeStoreMap.set(folderNode.id, writable(folderNode));
  });

  it('is disabled for empty folder', () => {
    expect(folderNode.children).toHaveLength(0);
    expect(menuItem.enabled(folderNode.id)).toBe(false);
  });

  it('is enabled for non-empty folder', () => {
    expect(folderNode.children).toHaveLength(0);
    folderNode.children.push(createBookmarkNode());
    expect(menuItem.enabled(folderNode.id)).toBe(true);
  });
});
