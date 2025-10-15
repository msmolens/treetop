import type * as Treetop from '@Treetop/treetop/types';

import { MenuItem, type OnClickedCallback } from './MenuItem';

/**
 * Menu item to open a folder's immediate children in tabs.
 */
export class OpenAllInTabsMenuItem extends MenuItem {
  constructor(
    private readonly builtInFolderInfo: Treetop.BuiltInFolderInfo,
    private readonly folderNodeMap: Treetop.FolderNodeMap,
    onClickedCallback: OnClickedCallback,
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

    const folderNode = this.folderNodeMap.get(nodeId);
    if (folderNode === undefined) {
      return false;
    }

    return folderNode.children.length > 0;
  }
}
