<script lang="ts">
  // Wrapper component to test Bookmark component with context.
  import type { ComponentProps } from 'svelte';
  import type { SvelteDate } from 'svelte/reactivity';

  import Bookmark from '@Treetop/treetop/Bookmark.svelte';
  import {
    setClock,
    setLastVisitTimeMap,
    setTooltips,
    setTruncate,
  } from '@Treetop/treetop/context';
  import * as Treetop from '@Treetop/treetop/types';

  type BookmarkProps = ComponentProps<typeof Bookmark>;

  type Props = BookmarkProps & {
    lastVisitTimeMap: Treetop.LastVisitTimeMap;
    truncate: () => boolean;
    tooltips: () => boolean;
    clock: SvelteDate;
  };

  const { lastVisitTimeMap, truncate, tooltips, clock, ...props }: Props =
    $props();

  setLastVisitTimeMap(lastVisitTimeMap);
  setTruncate(truncate);
  setTooltips(tooltips);
  setClock(clock);
</script>

<Bookmark {...props} />
