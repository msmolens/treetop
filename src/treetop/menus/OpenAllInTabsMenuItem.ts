import { get } from 'svelte/store';

import type * as Treetop from '@Treetop/treetop/types';

import { MenuItem, type OnClickedCallback } from './MenuItem';

/**
 * Menu item to open a folder's immediate children in tabs.
 */
export class OpenAllInTabsMenuItem extends MenuItem {
  constructor(
    private readonly builtInFolderInfo: Treetop.BuiltInFolderInfo,
    private readonly nodeStoreMap: Treetop.NodeStoreMap,
    onClickedCallback: OnClickedCallback
  ) {
    super(onClickedCallback);
  }

  enabled(nodeId: string): boolean {
    //
    // Enable for non-empty folders, excluding the bookmarks root
    //

    if (nodeId === this.builtInFolderInfo.rootNodeId) {
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
