import type { Writable } from 'svelte/store';

// Bookmark node type
export enum NodeType {
  Bookmark,
  Folder,
  Separator,
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

export interface SeparatorNode extends BaseNode {
  type: NodeType.Separator;
}

export type Node = BookmarkNode | FolderNode | SeparatorNode;

// Map from node ID to a store holding a folder node.
// Provides access to bookmark data.
export type NodeStoreMap = Map<string, Writable<FolderNode>>;

// Map from node ID to last visit time in milliseconds since the epoch.
// Provides access to the last visist times of bookmarks.
export type LastVisitTimeMap = Map<string, Writable<number>>;

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

// Function to unsubscribe from a store's value updates
export type SvelteStoreUnsubscriber = () => void;
