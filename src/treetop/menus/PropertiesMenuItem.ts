import type * as Treetop from '@Treetop/treetop/types';

import { MenuItem, type OnClickedCallback } from './MenuItem';

/**
 * Menu item to show the properties dialog for a bookmark or folder.
 */
export class PropertiesMenuItem extends MenuItem {
  constructor(
    private readonly builtInFolderInfo: Treetop.BuiltInFolderInfo,
    onClickedCallback: OnClickedCallback
  ) {
    super(onClickedCallback);
  }

  enabled(nodeId: string): boolean {
    // Disable modifying built-in folders
    const { rootNodeId, builtInFolderIds } = this.builtInFolderInfo;
    if (rootNodeId === nodeId || builtInFolderIds.includes(nodeId)) {
      return false;
    }

    return true;
  }
}
