import { Writable, writable } from 'svelte/store';
import faker from 'faker';

import {
  BOOKMARKS_MENU_GUID,
  BOOKMARKS_ROOT_GUID,
  BOOKMARKS_TOOLBAR_GUID,
  OTHER_BOOKMARKS_GUID,
} from '@Treetop/treetop/constants';
import { DeleteMenuItem } from '@Treetop/treetop/menus/DeleteMenuItem';
import type { OnClickedCallback } from '@Treetop/treetop/menus/MenuItem';
import type * as Treetop from '@Treetop/treetop/types';

import { createFolderNode } from '../../utils/factories';

let menuItem: DeleteMenuItem;
let nodeStoreMap: Treetop.NodeStoreMap;
let filterActive: Writable<boolean>;

beforeEach(() => {
  nodeStoreMap = new Map() as Treetop.NodeStoreMap;
  filterActive = writable(false);

  const callback: OnClickedCallback = (nodeId) => {
    void nodeId;
  };

  menuItem = new DeleteMenuItem(nodeStoreMap, filterActive, callback);
});

it.each([
  BOOKMARKS_MENU_GUID,
  BOOKMARKS_ROOT_GUID,
  BOOKMARKS_TOOLBAR_GUID,
  OTHER_BOOKMARKS_GUID,
])('is disabled for special bookmark root: %p', (nodeId) => {
  expect(menuItem.enabled(nodeId)).toBe(false);
});

it('is enabled for normal bookmark node IDs', () => {
  const nodeId = faker.random.alphaNumeric(8);
  expect(menuItem.enabled(nodeId)).toBe(true);
});

describe('when a filter is active', () => {
  let folderNode: Treetop.FolderNode;

  beforeEach(() => {
    folderNode = createFolderNode();
    nodeStoreMap.set(folderNode.id, writable(folderNode));

    filterActive.set(true);
  });

  it('is disabled for a folder', () => {
    expect(menuItem.enabled(folderNode.id)).toBe(false);
  });

  it('is enabled for a bookmark', () => {
    const nodeId = faker.random.alphaNumeric(8);
    expect(menuItem.enabled(nodeId)).toBe(true);
  });
});
