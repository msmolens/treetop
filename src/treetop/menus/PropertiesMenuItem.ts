import {
  BOOKMARKS_MENU_GUID,
  BOOKMARKS_ROOT_GUID,
  BOOKMARKS_TOOLBAR_GUID,
  OTHER_BOOKMARKS_GUID,
} from '@Treetop/treetop/constants';

import { MenuItem, type OnClickedCallback } from './MenuItem';

/**
 * Menu item to show the properties dialog for a bookmark or folder.
 */
export class PropertiesMenuItem extends MenuItem {
  constructor(onClickedCallback: OnClickedCallback) {
    super(onClickedCallback);
  }

  enabled(nodeId: string): boolean {
    // Disable modifying special bookmark roots
    return (
      nodeId !== BOOKMARKS_ROOT_GUID &&
      nodeId !== BOOKMARKS_TOOLBAR_GUID &&
      nodeId !== BOOKMARKS_MENU_GUID &&
      nodeId !== OTHER_BOOKMARKS_GUID
    );
  }
}
