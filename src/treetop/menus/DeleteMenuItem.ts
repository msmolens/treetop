import {
  BOOKMARKS_MENU_GUID,
  BOOKMARKS_ROOT_GUID,
  BOOKMARKS_TOOLBAR_GUID,
  OTHER_BOOKMARKS_GUID,
} from '@Treetop/treetop/constants';

import type { OnClickedCallback } from './MenuItem';
import { MenuItem } from './MenuItem';

/**
 * Menu item to delete a bookmark or folder.
 */
export class DeleteMenuItem extends MenuItem {
  constructor(onClickedCallback: OnClickedCallback) {
    super(onClickedCallback);
  }

  enabled(nodeId: string): boolean {
    // Disable deleting special bookmark roots
    return (
      nodeId !== BOOKMARKS_ROOT_GUID &&
      nodeId !== BOOKMARKS_TOOLBAR_GUID &&
      nodeId !== BOOKMARKS_MENU_GUID &&
      nodeId !== OTHER_BOOKMARKS_GUID
    );
  }
}
