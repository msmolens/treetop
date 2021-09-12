import { get, Writable } from 'svelte/store';

import {
  BOOKMARKS_MENU_GUID,
  BOOKMARKS_ROOT_GUID,
  BOOKMARKS_TOOLBAR_GUID,
  OTHER_BOOKMARKS_GUID,
} from '@Treetop/treetop/constants';
import type * as Treetop from '@Treetop/treetop/types';

import type { OnClickedCallback } from './MenuItem';
import { MenuItem } from './MenuItem';

/**
 * Menu item to delete a bookmark or folder.
 */
export class DeleteMenuItem extends MenuItem {
  constructor(
    private readonly nodeStoreMap: Treetop.NodeStoreMap,
    private readonly filterActive: Writable<boolean>,
    onClickedCallback: OnClickedCallback
  ) {
    super(onClickedCallback);
  }

  enabled(nodeId: string): boolean {
    // Disable deleting special bookmark roots
    if (
      nodeId === BOOKMARKS_ROOT_GUID ||
      nodeId === BOOKMARKS_TOOLBAR_GUID ||
      nodeId === BOOKMARKS_MENU_GUID ||
      nodeId === OTHER_BOOKMARKS_GUID
    ) {
      return false;
    }

    // Disable deleting folders when filter is active
    if (this.nodeStoreMap.has(nodeId) && get(this.filterActive)) {
      return false;
    }

    return true;
  }
}
