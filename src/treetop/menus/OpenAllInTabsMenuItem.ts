import { get } from 'svelte/store';

import { BOOKMARKS_ROOT_GUID } from '@Treetop/treetop/constants';
import type * as Treetop from '@Treetop/treetop/types';

import { type OnClickedCallback, MenuItem } from './MenuItem';

/**
 * Menu item to open a folder's immediate children in tabs.
 */
export class OpenAllInTabsMenuItem extends MenuItem {
  constructor(
    private readonly nodeStoreMap: Treetop.NodeStoreMap,
    onClickedCallback: OnClickedCallback
  ) {
    super(onClickedCallback);
  }

  enabled(nodeId: string): boolean {
    //
    // Enable for non-empty folders, excluding the bookmarks root
    //

    if (nodeId === BOOKMARKS_ROOT_GUID) {
      return false;
    }

    const nodeStore = this.nodeStoreMap.get(nodeId);
    if (nodeStore === undefined) {
      return false;
    }

    const node: Treetop.FolderNode = get(nodeStore);

    return node.children.length > 0;
  }
}
