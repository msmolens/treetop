<script lang="ts">
  import * as Treetop from './types';
  import type { Writable } from 'svelte/store';
  import { browser } from 'webextension-polyfill-ts';

  import { getContext } from 'svelte';
  import { get } from 'svelte/store';

  import Bookmark from './Bookmark.svelte';
  import { BOOKMARKS_ROOT_GUID } from './constants';

  export let nodeId: string;
  export let root: boolean = false;

  const nodeStoreMap: Treetop.NodeStoreMap = getContext('nodeStoreMap');

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

    if (nodeId === BOOKMARKS_ROOT_GUID) {
      key = 'bookmarks';
    } else {
      key = 'folderNoTitle';
    }

    return browser.i18n.getMessage(key);
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

  hr {
    border: 1px solid #9e9e9e;
    border-width: 1px;
    margin: 0.5rem auto;
  }
</style>

<svelte:head>
  {#if root}
    <title>{documentTitle}</title>
  {/if}
</svelte:head>

{#if $node}
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
      {#each $node.children as child (child.id)}
        {#if child.type === Treetop.NodeType.Bookmark}
          <Bookmark nodeId={child.id} title={child.title} url={child.url} />
        {:else if child.type === Treetop.NodeType.Folder}
          <svelte:self nodeId={child.id} />
        {:else if child.type === Treetop.NodeType.Separator}
          <hr />
        {/if}
      {:else}<em>{browser.i18n.getMessage('emptyFolder')}</em>{/each}
    </div>
  </div>
{/if}
