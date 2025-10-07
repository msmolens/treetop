import { writable } from 'svelte/store';
import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it } from 'vitest';

import type { OnClickedCallback } from '@Treetop/treetop/menus/MenuItem';
import { OpenAllInTabsMenuItem } from '@Treetop/treetop/menus/OpenAllInTabsMenuItem';
import type * as Treetop from '@Treetop/treetop/types';

import {
  createBookmarkNode,
  createFolderNode,
} from '../../../test/utils/factories';

let menuItem: OpenAllInTabsMenuItem;
let nodeStoreMap: Treetop.NodeStoreMap;

const BUILT_IN_FOLDER_INFO: Treetop.BuiltInFolderInfo = {
  rootNodeId: 'bookmarks-root-id',
  builtInFolderIds: [],
};

beforeEach(() => {
  nodeStoreMap = new Map() as Treetop.NodeStoreMap;

  const callback: OnClickedCallback = (nodeId) => {
    void nodeId;
  };

  menuItem = new OpenAllInTabsMenuItem(
    BUILT_IN_FOLDER_INFO,
    nodeStoreMap,
    callback,
  );
});

it('is disabled for the bookmarks root', () => {
  expect(menuItem.enabled(BUILT_IN_FOLDER_INFO.rootNodeId!)).toBe(false);
});

it('is disabled for bookmarks', () => {
  const nodeId = faker.string.alphanumeric(8);
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
