import { SvelteMap } from 'svelte/reactivity';
import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it } from 'vitest';

import { DeleteMenuItem } from '@Treetop/treetop/menus/DeleteMenuItem';
import type { OnClickedCallback } from '@Treetop/treetop/menus/MenuItem';
import type * as Treetop from '@Treetop/treetop/types';

import { createFolderNode } from '../../../test/utils/factories';

let menuItem: DeleteMenuItem;
let folderNodeMap: Treetop.FolderNodeMap;
let currentFilterActive: boolean;
const filterActive = () => currentFilterActive;

const BUILT_IN_FOLDER_INFO: Treetop.BuiltInFolderInfo = {
  rootNodeId: 'bookmarks-root-id',
  builtInFolderIds: ['bookmarks-toolbar-id', 'other-bookmarks-id'],
};

beforeEach(() => {
  folderNodeMap = new SvelteMap();
  currentFilterActive = false;

  const callback: OnClickedCallback = (nodeId) => {
    void nodeId;
  };

  menuItem = new DeleteMenuItem(
    BUILT_IN_FOLDER_INFO,
    folderNodeMap,
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
  const nodeId = faker.string.alphanumeric(8);
  expect(menuItem.enabled(nodeId)).toBe(true);
});

describe('when a filter is active', () => {
  let folderNode: Treetop.FolderNode;

  beforeEach(() => {
    folderNode = createFolderNode();
    folderNodeMap.set(folderNode.id, folderNode);

    currentFilterActive = true;
  });

  it('is disabled for a folder', () => {
    expect(menuItem.enabled(folderNode.id)).toBe(false);
  });

  it('is enabled for a bookmark', () => {
    const nodeId = faker.string.alphanumeric(8);
    expect(menuItem.enabled(nodeId)).toBe(true);
  });
});
