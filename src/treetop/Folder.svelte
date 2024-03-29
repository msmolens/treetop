<script lang="ts">
  import { getContext } from 'svelte';
  import { get, type Writable } from 'svelte/store';

  import Bookmark from './Bookmark.svelte';
  import * as Treetop from './types';

  export let nodeId: string;
  export let root = false;

  const builtInFolderInfo: Treetop.BuiltInFolderInfo =
    getContext('builtInFolderInfo');
  const nodeStoreMap: Treetop.NodeStoreMap = getContext('nodeStoreMap');
  const filterActive = getContext<Writable<boolean>>('filterActive');
  const filterSet = getContext<Treetop.FilterSet>('filterSet');

  let node: Writable<Treetop.FolderNode> = nodeStoreMap.get(nodeId)!;

  // Nodes for the folder heading.
  // For the root folder, get the folder nodes from bookmarks root to the selected root.
  // Otherwise, include only the folder node itself.
  let folderNodes: Treetop.FolderNode[];
  $: if (root) {
    folderNodes = getFolderNodes($node);
  } else {
    folderNodes = [$node];
  }

  // Include selected root title in document title.
  // Don't use fallback title.
  $: documentTitle = $node.title ? `Treetop: ${$node.title}` : 'Treetop';

  /**
   * Get folder nodes from bookmarks root to the selected root.
   */
  function getFolderNodes(node: Treetop.FolderNode): Treetop.FolderNode[] {
    const nodes = [node];

    while (node.parentId) {
      const nodeStore = nodeStoreMap.get(node.parentId)!;
      node = get(nodeStore);
      nodes.unshift(node);
    }

    return nodes;
  }

  /**
   * When a folder node has no title, get a fallback string.
   */
  function getFallbackTitle(nodeId: string): string {
    let key;

    if (nodeId === builtInFolderInfo.rootNodeId) {
      key = 'bookmarks';
    } else {
      key = 'folderNoTitle';
    }

    return chrome.i18n.getMessage(key);
  }
</script>

<style>
  .folder {
    margin-left: 1rem;
    margin-top: 1rem;
  }

  .root {
    margin-left: 0;
    margin-top: 0;
  }

  .heading {
    background-color: #1074e7;
    border-radius: 0.5rem;
    border: 1px solid #1074e7;
    color: #fff;
    display: inline-block;
    font-size: 1.25rem;
    line-height: 1.15;
    padding: 0.5rem 0.75rem;
    white-space: nowrap;
  }

  .heading:hover {
    background-color: #0366d6;
    border-color: #0366d6;
  }

  .title {
    display: flex;
  }
  .title a:link {
    color: #fff;
    text-decoration: none;
  }
  .title a:visited {
    color: #fff;
  }
  .title a:hover {
    text-decoration: underline;
  }

  .contents {
    line-height: 1.75;
    margin: 1rem 0 1rem 1rem;
  }
</style>

<svelte:head>
  {#if root}
    <title>{documentTitle}</title>
  {/if}
</svelte:head>

{#if $node && (root || !$filterActive || $filterSet.has($node.id))}
  <div class="folder" class:root>
    <div class="heading">
      <div class="title">
        {#each folderNodes as { id, title }, i (id)}
          <a href="#{id || ''}" data-node-id={id}>
            {title || getFallbackTitle(id)}
          </a>
          {#if i < folderNodes.length - 1}&nbsp;/&nbsp;{/if}
        {/each}
      </div>
    </div>
    <div class="contents">
      {#if root && $filterActive && !$filterSet.has(nodeId)}
        <!-- svelte-ignore missing-declaration -->
        <em>{chrome.i18n.getMessage('noResults')}</em>
      {/if}
      {#each $node.children as child (child.id)}
        {#if child.type === Treetop.NodeType.Bookmark}
          <!--
            Destructure child to work around the following false positive linter
            error when calling $filterSet.has(child.id):

            Unsafe argument of type `any` assigned to a parameter of type `string`  @typescript-eslint/no-unsafe-argument
          -->
          {@const { id, title, url } = child}
          {#if !$filterActive || $filterSet.has(id)}
            <Bookmark nodeId={id} {title} {url} />
          {/if}
        {:else if child.type === Treetop.NodeType.Folder}
          <svelte:self nodeId={child.id} />
        {/if}
      {:else}
        <!-- svelte-ignore missing-declaration -->
        <em>{chrome.i18n.getMessage('emptyFolder')}</em>
      {/each}
    </div>
  </div>
{/if}
