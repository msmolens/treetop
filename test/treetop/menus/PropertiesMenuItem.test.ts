import faker from 'faker';

import {
  BOOKMARKS_MENU_GUID,
  BOOKMARKS_ROOT_GUID,
  BOOKMARKS_TOOLBAR_GUID,
  OTHER_BOOKMARKS_GUID,
} from '@Treetop/treetop/constants';
import type { OnClickedCallback } from '@Treetop/treetop/menus/MenuItem';
import { PropertiesMenuItem } from '@Treetop/treetop/menus/PropertiesMenuItem';

let menuItem: PropertiesMenuItem;

beforeEach(() => {
  const callback: OnClickedCallback = (nodeId) => {
    void nodeId;
  };

  menuItem = new PropertiesMenuItem(callback);
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
