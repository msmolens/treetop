import type * as Treetop from '@Treetop/treetop/types';

import { MenuItem, type OnClickedCallback } from './MenuItem';

/**
 * Menu item to delete a bookmark or folder.
 */
export class DeleteMenuItem extends MenuItem {
  constructor(
    private readonly builtInFolderInfo: Treetop.BuiltInFolderInfo,
    private readonly nodeStoreMap: Treetop.NodeStoreMap,
    private readonly filterActive: () => boolean,
    onClickedCallback: OnClickedCallback,
  ) {
    super(onClickedCallback);
  }

  enabled(nodeId: string): boolean {
    // Disable deleting built-in folders
    const { rootNodeId, builtInFolderIds } = this.builtInFolderInfo;
    if (rootNodeId === nodeId || builtInFolderIds.includes(nodeId)) {
      return false;
    }

    // Disable deleting folders when filter is active
    if (this.nodeStoreMap.has(nodeId) && this.filterActive()) {
      return false;
    }

    return true;
  }
}
