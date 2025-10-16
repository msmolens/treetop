import { createContext } from 'svelte';
import type { SvelteDate } from 'svelte/reactivity';

import * as Treetop from './types';

export const [getBuiltInFolderInfo, setBuiltInFolderInfo] =
  createContext<Treetop.BuiltInFolderInfo>();

export const [getClock, setClock] = createContext<SvelteDate>();

export const [getFilterActive, setFilterActive] =
  createContext<() => boolean>();

export const [getFilterSet, setFilterSet] = createContext<Treetop.FilterSet>();

export const [getFolderNodeMap, setFolderNodeMap] =
  createContext<Treetop.FolderNodeMap>();

export const [getLastVisitTimeMap, setLastVisitTimeMap] =
  createContext<Treetop.LastVisitTimeMap>();

export const [getTooltips, setTooltips] =
  createContext<() => Treetop.PreferenceValue>();

export const [getTruncate, setTruncate] =
  createContext<() => Treetop.PreferenceValue>();
