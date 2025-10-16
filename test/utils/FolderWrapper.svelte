<script lang="ts">
  // Wrapper component to test Folder component with context.
  import type { ComponentProps } from 'svelte';
  import type { SvelteDate } from 'svelte/reactivity';

  import {
    setBuiltInFolderInfo,
    setClock,
    setFilterActive,
    setFilterSet,
    setFolderNodeMap,
    setLastVisitTimeMap,
    setTooltips,
    setTruncate,
  } from '@Treetop/treetop/context';
  import Folder from '@Treetop/treetop/Folder.svelte';
  import * as Treetop from '@Treetop/treetop/types';

  type FolderProps = ComponentProps<typeof Folder>;

  type Props = FolderProps & {
    builtInFolderInfo: Treetop.BuiltInFolderInfo;
    folderNodeMap: Treetop.FolderNodeMap;
    filterActive: () => boolean;
    filterSet: Treetop.FilterSet;
    lastVisitTimeMap: Treetop.LastVisitTimeMap;
    truncate: () => boolean;
    tooltips: () => boolean;
    clock: SvelteDate;
  };

  const {
    builtInFolderInfo,
    folderNodeMap,
    lastVisitTimeMap,
    filterActive,
    filterSet,
    truncate,
    tooltips,
    clock,
    ...props
  }: Props = $props();

  setBuiltInFolderInfo(builtInFolderInfo);
  setFolderNodeMap(folderNodeMap);
  setLastVisitTimeMap(lastVisitTimeMap);
  setFilterActive(filterActive);
  setFilterSet(filterSet);
  setTruncate(truncate);
  setTooltips(tooltips);
  setClock(clock);
</script>

<Folder {...props} />
