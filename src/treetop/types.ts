import type { SvelteMap, SvelteSet } from 'svelte/reactivity';

// Bookmark node type
export enum NodeType {
  Bookmark,
  Folder,
}

interface BaseNode {
  id: string;
  parentId?: string;
}

export interface BookmarkNode extends BaseNode {
  type: NodeType.Bookmark;
  title: string;
  url: string;
}

export interface FolderNode extends BaseNode {
  type: NodeType.Folder;
  title: string;
  children: Node[];
}

export type Node = BookmarkNode | FolderNode;

// Map from node ID to a folder node.
// Provides access to bookmark data.
export type FolderNodeMap = SvelteMap<string, FolderNode>;

// Map from node ID to last visit time in milliseconds since the epoch.
// Provides access to the last visit times of bookmarks.
export type LastVisitTimeMap = SvelteMap<string, number>;

// Set of node IDs that match the active filter.
export type FilterSet = SvelteSet<string>;

// Changes to a bookmark's properties
export interface PropertiesChanges {
  title: string;
  url?: string;
}

// Preference value in extension storage
export type PreferenceValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[];

export interface BuiltInFolderInfo {
  // Root bookmark node ID.
  rootNodeId: string | null;
  // Node IDs of built-in folders under the root bookmark node.
  builtInFolderIds: string[];
}

//
// Chrome types
//

export type ChromeEventCallback<TEvent> =
  TEvent extends chrome.events.Event<infer TCallback> ? TCallback : never;

export type BookmarkChangeInfo = Parameters<
  ChromeEventCallback<typeof chrome.bookmarks.onChanged>
>[1];

export type BookmarkCreatedInfo = Parameters<
  ChromeEventCallback<typeof chrome.bookmarks.onCreated>
>[1];

export type BookmarkMoveInfo = Parameters<
  ChromeEventCallback<typeof chrome.bookmarks.onMoved>
>[1];

export type BookmarkRemoveInfo = Parameters<
  ChromeEventCallback<typeof chrome.bookmarks.onRemoved>
>[1];

export type HistoryRemovedResult = Parameters<
  ChromeEventCallback<typeof chrome.history.onVisitRemoved>
>[0];
