import { type Writable, writable } from 'svelte/store';
import faker from 'faker';
import { beforeEach, describe, expect, it } from 'vitest';

import { DeleteMenuItem } from '@Treetop/treetop/menus/DeleteMenuItem';
import type { OnClickedCallback } from '@Treetop/treetop/menus/MenuItem';
import type * as Treetop from '@Treetop/treetop/types';

import { createFolderNode } from '../../../test/utils/factories';

let menuItem: DeleteMenuItem;
let nodeStoreMap: Treetop.NodeStoreMap;
let filterActive: Writable<boolean>;

const BUILT_IN_FOLDER_INFO: Treetop.BuiltInFolderInfo = {
  rootNodeId: 'bookmarks-root-id',
  builtInFolderIds: ['bookmarks-toolbar-id', 'other-bookmarks-id'],
};

beforeEach(() => {
  nodeStoreMap = new Map() as Treetop.NodeStoreMap;
  filterActive = writable(false);

  const callback: OnClickedCallback = (nodeId) => {
    void nodeId;
  };

  menuItem = new DeleteMenuItem(
    BUILT_IN_FOLDER_INFO,
    nodeStoreMap,
    filterActive,
    callback,
  );
});

it('is disabled for built-in folders', () => {
  expect(menuItem.enabled(BUILT_IN_FOLDER_INFO.rootNodeId!)).toBe(false);

  for (const nodeId of BUILT_IN_FOLDER_INFO.builtInFolderIds) {
    expect(menuItem.enabled(nodeId)).toBe(false);
  }
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
