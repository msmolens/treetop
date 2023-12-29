import faker from 'faker';
import { beforeEach, expect, it } from 'vitest';

import type { OnClickedCallback } from '@Treetop/treetop/menus/MenuItem';
import { PropertiesMenuItem } from '@Treetop/treetop/menus/PropertiesMenuItem';
import type * as Treetop from '@Treetop/treetop/types';

let menuItem: PropertiesMenuItem;

const BUILT_IN_FOLDER_INFO: Treetop.BuiltInFolderInfo = {
  rootNodeId: 'bookmarks-root-id',
  builtInFolderIds: ['bookmarks-toolbar-id', 'other-bookmarks-id'],
};

beforeEach(() => {
  const callback: OnClickedCallback = (nodeId) => {
    void nodeId;
  };

  menuItem = new PropertiesMenuItem(BUILT_IN_FOLDER_INFO, callback);
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
