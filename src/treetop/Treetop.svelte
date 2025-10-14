<script lang="ts">
  import { onDestroy, onMount, setContext } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { get, type Unsubscriber, type Writable } from 'svelte/store';
  import { fade } from 'svelte/transition';
  import LinearProgress from '@smui/linear-progress';
  import Snackbar, { Label } from '@smui/snackbar';

  import icon from '../icons/generated/icons/icon.svg';

  import { DeleteMenuItem } from './menus/DeleteMenuItem';
  import { MenuManager } from './menus/MenuManager';
  import { OpenAllInTabsMenuItem } from './menus/OpenAllInTabsMenuItem';
  import { PropertiesMenuItem } from './menus/PropertiesMenuItem';
  import { BookmarksManager } from './BookmarksManager';
  import { createClock } from './clock.svelte';
  import ConfirmationDialog from './ConfirmationDialog.svelte';
  import FilterInput from './FilterInput.svelte';
  import { FilterManager } from './FilterManager';
  import Folder from './Folder.svelte';
  import { HistoryManager } from './HistoryManager';
  import PageFooter from './PageFooter.svelte';
  import PageHeader from './PageHeader.svelte';
  import { PreferencesManager } from './PreferencesManager';
  import PropertiesDialog from './PropertiesDialog.svelte';
  import * as Treetop from './types';

  interface Props {
    rootBookmarkId: string | null;
  }

  let { rootBookmarkId }: Props = $props();

  //
  // Init preferences
  //

  const preferencesManager = new PreferencesManager();
  const truncate = preferencesManager.createStore('truncate', true);
  const tooltips = preferencesManager.createStore('tooltips', true);
  const showRecentlyVisited = preferencesManager.createStore(
    'showRecentlyVisited',
    true,
  );
  const colorScheme = preferencesManager.createStore('colorScheme', 'light');

  // Make select preferences available to other components
  setContext('truncate', truncate);
  setContext('tooltips', tooltips);

  // Function to unsubscribe from the 'showRecentlyVisited' preference
  let unsubscribeShowRecentlyVisited: Unsubscriber;

  //
  // Create bookmarks data and manager
  //

  // ID to node store map.
  // Populated with a store for each folder.
  const nodeStoreMap: Treetop.NodeStoreMap = new Map<
    string,
    Writable<Treetop.FolderNode>
  >();

  // ID to last visit time map.
  // Populated with a store for each bookmark.
  const lastVisitTimeMap: Treetop.LastVisitTimeMap = new Map<
    string,
    Writable<number>
  >();

  // Set of node IDs that match the active filter.
  const filterSet: Treetop.FilterSet = new SvelteSet();

  // Built-in folder info
  const builtInFolderInfo: Treetop.BuiltInFolderInfo = {
    rootNodeId: null,
    builtInFolderIds: [],
  };

  // Bookmarks manager
  const bookmarksManager = new BookmarksManager(
    nodeStoreMap,
    builtInFolderInfo,
  );

  // History manager
  const historyManager = new HistoryManager(lastVisitTimeMap);

  // Filter manager
  const filterManager = new FilterManager(filterSet, nodeStoreMap);

  // Whether the filter is active.
  let filterActive = $state(false);

  // Clock to age recently visited bookmarks
  const clock = createClock();

  // Make bookmark data available to other components
  setContext('builtInFolderInfo', builtInFolderInfo);
  setContext('nodeStoreMap', nodeStoreMap);
  setContext('lastVisitTimeMap', lastVisitTimeMap);
  setContext('filterActive', () => filterActive);
  setContext('filterSet', filterSet);
  setContext('clock', clock);

  //
  // Error notification
  //

  let errorSnackbar: Snackbar;
  let errorMessage: string | undefined = $state();

  //
  // Delete folder confirmation dialog
  //

  const deleteFolderDialogInfo = $state({
    open: false,
    title: chrome.i18n.getMessage('dialogHeadingDeleteFolder'),
    message: chrome.i18n.getMessage('dialogMessageDeleteFolder'),
    cancelLabel: chrome.i18n.getMessage('dialogButtonCancel'),
    confirmLabel: chrome.i18n.getMessage('dialogButtonDelete'),
  });
  let deleteFolderId: string | null;

  //
  // Properties dialog
  //

  const propertiesDialogInfo = $state({
    open: false,
  });
  let propertiesNode: chrome.bookmarks.BookmarkTreeNode | null = $state(null);

  //
  // Filter input
  //

  let filterInput: FilterInput | undefined = $state();

  //
  // Menu manager
  //

  let menuManager: MenuManager | null = null;

  // Body element
  let body: HTMLElement | undefined = $state();

  // Manually update class for body element
  // See https://github.com/sveltejs/svelte/issues/3105
  $effect(() => {
    if (body) {
      body.classList.remove('colorSchemeLight');
      body.classList.remove('colorSchemeDark');

      if ($colorScheme === 'light') {
        body.classList.add('colorSchemeLight');
      } else if ($colorScheme === 'dark') {
        body.classList.add('colorSchemeDark');
      }
    }
  });

  /**
   * Show an error notification.
   */
  function handleError(err: Error | string) {
    errorMessage = err.toString();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    errorSnackbar.open();
  }

  /**
   * Open a folder's immediate children in tabs.
   *
   * If a filter is active, open only the children that match the filter.
   */
  function openAllInTabs(nodeId: string) {
    const nodeStore = nodeStoreMap.get(nodeId)!;
    const node: Treetop.FolderNode = get(nodeStore);

    const activeFilterSet = filterActive ? filterSet : undefined;

    const promises: Promise<chrome.tabs.Tab>[] = [];

    node.children.forEach((child) => {
      if (child.type === Treetop.NodeType.Bookmark) {
        if (!activeFilterSet || activeFilterSet.has(child.id)) {
          promises.push(
            chrome.tabs.create({
              url: child.url,
            }),
          );
        }
      }
    });

    Promise.all(promises).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorOpeningTab'));
    });
  }

  async function asyncShowPropertiesDialog(nodeId: string) {
    [propertiesNode] = await chrome.bookmarks.get(nodeId);

    propertiesDialogInfo.open = true;
  }

  /**
   * Show the properties dialog for a bookmark or folder.
   */
  function showPropertiesDialog(nodeId: string) {
    asyncShowPropertiesDialog(nodeId).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorRetrievingBookmark'));
    });
  }

  /**
   * Properties dialog cancel handler.
   */
  function cancelProperties() {
    propertiesDialogInfo.open = false;
    propertiesNode = null;
  }

  /**
   * Properties dialog save handler.
   */
  async function saveProperties(changes: Treetop.PropertiesChanges) {
    propertiesDialogInfo.open = false;

    try {
      await chrome.bookmarks.update(propertiesNode!.id, changes);
    } catch (err: unknown) {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorSavingBookmark'));
    }

    propertiesNode = null;
  }

  /**
   * Delete a bookmark or folder. When deleting a non-empty folder, show a
   * confirmation dialog.
   */
  function deleteBookmark(nodeId: string) {
    const nodeStore = nodeStoreMap.get(nodeId);
    if (nodeStore !== undefined) {
      // Folder
      const node = get(nodeStore);
      if (node.children.length === 0) {
        chrome.bookmarks.remove(nodeId).catch((err: unknown) => {
          console.error(err);
          handleError(chrome.i18n.getMessage('errorDeletingFolder'));
        });
      } else {
        deleteFolderId = nodeId;
        deleteFolderDialogInfo.open = true;
      }
    } else {
      // Bookmark
      chrome.bookmarks.remove(nodeId).catch((err: unknown) => {
        console.error(err);
        handleError(chrome.i18n.getMessage('errorDeletingBookmark'));
      });
    }
  }

  /**
   * Delete folder confirmation dialog cancel handler.
   */
  function cancelDeleteBookmark() {
    deleteFolderDialogInfo.open = false;
    deleteFolderId = null;
  }

  /**
   * Delete folder confirmation dialog confirm handler.
   */
  function confirmDeleteBookmark() {
    deleteFolderDialogInfo.open = false;
    chrome.bookmarks.removeTree(deleteFolderId!).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorDeletingFolder'));
    });
    deleteFolderId = null;
  }

  /**
   * Reload when hash changes to update for new root bookmark node.
   */
  function onHashChange() {
    window.location.reload();
  }

  /**
   * Focus filter input when pressing '/'.
   * Based on https://justincypret.com/blog/adding-a-keyboard-shortcut-for-global-search.
   */
  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== '/' || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    if (/^(?:button|input|textarea|select)$/i.test(e.target.tagName)) {
      return;
    }

    e.preventDefault();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    filterInput?.focus();
  }

  //
  // Bookmark event handlers
  //

  async function asyncOnBookmarkCreated(
    id: string,
    bookmark: chrome.bookmarks.BookmarkTreeNode,
  ) {
    const promises: Promise<void>[] = [];

    promises.push(bookmarksManager.handleBookmarkCreated(id, bookmark));

    if ($showRecentlyVisited) {
      promises.push(historyManager.handleBookmarkCreated(id, bookmark));
    }

    await Promise.all(promises);

    filterManager.handleBookmarkCreated(id, bookmark);
  }

  function onBookmarkCreated(
    id: string,
    bookmark: chrome.bookmarks.BookmarkTreeNode,
  ) {
    asyncOnBookmarkCreated(id, bookmark).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorHandlingBookmarkCreation'));
    });
  }

  async function asyncOnBookmarkRemoved(
    id: string,
    removeInfo: Treetop.BookmarkRemoveInfo,
  ) {
    const removedNodeIds = await bookmarksManager.handleBookmarkRemoved(
      id,
      removeInfo,
    );

    filterManager.beginBatchRemove();
    removedNodeIds.forEach((nodeId) => {
      filterManager.handleBookmarkRemoved(nodeId);
    });
    filterManager.endBatchRemove();

    if ($showRecentlyVisited) {
      removedNodeIds.forEach((nodeId) => {
        historyManager.handleBookmarkRemoved(nodeId);
      });
    }
  }

  function onBookmarkRemoved(
    id: string,
    removeInfo: Treetop.BookmarkRemoveInfo,
  ) {
    asyncOnBookmarkRemoved(id, removeInfo).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorHandlingBookmarkRemoval'));
    });
  }

  async function asyncOnBookmarkChanged(
    id: string,
    changeInfo: Treetop.BookmarkChangeInfo,
  ) {
    await bookmarksManager.handleBookmarkChanged(id, changeInfo);

    filterManager.handleBookmarkChanged(id, changeInfo);

    if ($showRecentlyVisited) {
      await historyManager.handleBookmarkChanged(id, changeInfo);
    }
  }

  function onBookmarkChanged(
    id: string,
    changeInfo: Treetop.BookmarkChangeInfo,
  ) {
    asyncOnBookmarkChanged(id, changeInfo).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorHandlingBookmarkChange'));
    });
  }

  async function asyncOnBookmarkMoved(
    id: string,
    moveInfo: Treetop.BookmarkMoveInfo,
  ) {
    await bookmarksManager.handleBookmarkMoved(id, moveInfo);

    filterManager.handleBookmarkMoved(id, moveInfo);
  }

  function onBookmarkMoved(id: string, moveInfo: Treetop.BookmarkMoveInfo) {
    asyncOnBookmarkMoved(id, moveInfo).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorHandlingBookmarkMove'));
    });
  }

  //
  // History event handlers
  //

  async function asyncOnVisited(result: chrome.history.HistoryItem) {
    if ($showRecentlyVisited) {
      await historyManager.handleVisited(result);
    }
  }

  function onVisited(result: chrome.history.HistoryItem) {
    asyncOnVisited(result).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorHandlingHistoryVisit'));
    });
  }

  async function asyncOnVisitRemoved(removed: Treetop.HistoryRemovedResult) {
    if ($showRecentlyVisited) {
      await historyManager.handleVisitRemoved(removed);
    }
  }

  function onVisitRemoved(removed: Treetop.HistoryRemovedResult) {
    asyncOnVisitRemoved(removed).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorHandlingHistoryVisitRemoval'));
    });
  }

  //
  // Menu event handlers
  //

  function onContextMenu(event: Event) {
    asyncOnContextMenu(event).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorHandlingContextMenu'));
    });
  }

  async function asyncOnContextMenu(event: Event) {
    // Record the target element of the context menu
    if (menuManager && event.target instanceof HTMLElement) {
      menuManager.activeElement = event.target;

      await menuManager.updateEnabled();
    }
  }

  async function asyncOnMenuClicked(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
  ) {
    await menuManager?.handleMenuClicked(info, tab);
  }

  function onMenuClicked(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
  ) {
    asyncOnMenuClicked(info, tab).catch((err: unknown) => {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorHandlingMenuClick'));
    });
  }

  //
  // Filter input event handler
  //

  /**
   * Apply the current filter string.
   */
  function applyFilter(filter: string) {
    // Clear any previous filtering
    filterManager.clearFilter();
    filterActive = false;

    // Set the current filter if the string is not empty
    const value = filter.trim();
    if (value && value.length > 0) {
      filterManager.setFilter(value);
      filterActive = true;
    }
  }

  /**
   * Initialize page.
   * Return validated root bookmark ID.
   */
  async function init() {
    try {
      await preferencesManager.loadPreferences();
    } catch (err: unknown) {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorLoadingPreferences'));
    }

    // Register bookmark event handlers
    chrome.bookmarks.onCreated.addListener(onBookmarkCreated);
    chrome.bookmarks.onRemoved.addListener(onBookmarkRemoved);
    chrome.bookmarks.onChanged.addListener(onBookmarkChanged);
    chrome.bookmarks.onMoved.addListener(onBookmarkMoved);

    // Register history event handlers
    chrome.history.onVisited.addListener(onVisited);
    chrome.history.onVisitRemoved.addListener(onVisitRemoved);

    // Load bookmarks
    try {
      await bookmarksManager.loadBookmarks();
    } catch (err: unknown) {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorLoadingBookmarks'));
    }

    // Load history
    try {
      historyManager.init(nodeStoreMap);
      if ($showRecentlyVisited) {
        await historyManager.loadHistory(nodeStoreMap);
      }
    } catch (err: unknown) {
      console.error(err);
      handleError(chrome.i18n.getMessage('errorLoadingHistory'));
    }

    // Initialize or reset history manager when 'showRecentlyVisited' preference changes
    unsubscribeShowRecentlyVisited = showRecentlyVisited.subscribe((value) => {
      if (value) {
        historyManager.loadHistory(nodeStoreMap).catch((err: unknown) => {
          console.error(err);
          handleError(chrome.i18n.getMessage('errorLoadingHistory'));
        });
      } else {
        historyManager.unloadHistory();
      }
    });

    // Validate specified root bookmark ID, falling back to bookmarks root
    if (!rootBookmarkId || !nodeStoreMap.has(rootBookmarkId)) {
      rootBookmarkId = builtInFolderInfo.rootNodeId ?? '';
    }

    return rootBookmarkId;
  }

  onMount(() => {
    // Get body element
    body = document.body;

    // Register menu event handlers
    document.addEventListener('contextmenu', onContextMenu);
    chrome.contextMenus.onClicked.addListener(onMenuClicked);

    // Initialize menu manager
    menuManager = new MenuManager();
    menuManager.registerMenuItem(
      'delete',
      new DeleteMenuItem(
        builtInFolderInfo,
        nodeStoreMap,
        () => filterActive,
        deleteBookmark,
      ),
    );
    menuManager.registerMenuItem(
      'openAllInTabs',
      new OpenAllInTabsMenuItem(builtInFolderInfo, nodeStoreMap, openAllInTabs),
    );
    menuManager.registerMenuItem(
      'properties',
      new PropertiesMenuItem(builtInFolderInfo, showPropertiesDialog),
    );

    window.addEventListener('hashchange', onHashChange);
  });

  onDestroy(() => {
    // Unsubscribe from the 'showRecentlyVisited' option
    unsubscribeShowRecentlyVisited();

    // Unregister menu event handlers
    document.removeEventListener('contextmenu', onContextMenu);
    chrome.contextMenus.onClicked.removeListener(onMenuClicked);

    // Destroy menu manager
    menuManager = null;

    window.removeEventListener('hashchange', onHashChange);
  });

  // Initialize Treetop
  let ready = init();
</script>

<style>
  :global(html),
  :global(body) {
    background-color: var(--treetop-background-color);
    color: var(--treetop-color);
  }

  .progressContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: auto;
    flex-direction: column;
  }
  .progressContainer > img {
    width: 4%;
    min-width: 64px;
    margin: 8px;
  }
  .progress {
    width: 12%;
    min-width: 100px;
  }

  .treetopContainer {
    margin: 0 1rem;
    padding-top: 1.5rem;
  }
</style>

<svelte:head>
  {#if $colorScheme === 'light' || $colorScheme === 'system'}
    <link rel="stylesheet" href="/smui.css" />
  {:else if $colorScheme === 'dark'}
    <link rel="stylesheet" href="/smui-dark.css" />
  {/if}
</svelte:head>

<svelte:body onkeydown={onKeyDown} />

{#await ready}
  <div class="progressContainer">
    <img src={icon} alt="Treetop Icon" />
    <div class="progress">
      <LinearProgress class="treetopLinearProgress" indeterminate />
    </div>
  </div>
{:then rootNodeId}
  <PageHeader
    onError={() => {
      handleError(chrome.i18n.getMessage('errorLoadingPreferences'));
    }}>
    <FilterInput bind:this={filterInput} onInput={applyFilter} />
  </PageHeader>
  <main
    class="treetopContainer"
    transition:fade={{ delay: 100, duration: 250 }}>
    <Folder nodeId={rootNodeId} root={true} />
  </main>
  <PageFooter />

  <!-- Delete folder confirmation dialog -->
  <ConfirmationDialog
    {...deleteFolderDialogInfo}
    onCancel={cancelDeleteBookmark}
    onConfirm={confirmDeleteBookmark} />

  <!-- Bookmark properties dialog -->
  <PropertiesDialog
    {...propertiesDialogInfo}
    title={propertiesNode ? propertiesNode.title : ''}
    url={propertiesNode ? propertiesNode.url : ''}
    onCancel={cancelProperties}
    onSave={saveProperties} />
{/await}

<!-- Error notification -->
<Snackbar
  bind:this={errorSnackbar}
  class="treetopSnackbar"
  leading
  labelText={errorMessage}>
  <Label />
</Snackbar>
