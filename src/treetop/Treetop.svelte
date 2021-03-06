<script>
  import { onDestroy, onMount, setContext } from 'svelte';
  import type { Unsubscriber, Writable } from 'svelte/store';
  import { get, writable } from 'svelte/store';
  import { fade } from 'svelte/transition';
  import LinearProgress from '@smui/linear-progress';
  import Snackbar, { Label } from '@smui/snackbar';
  import { browser, Tabs } from 'webextension-polyfill-ts';

  import icon from '../icons/generated/icons/icon.svg';

  import { DeleteMenuItem } from './menus/DeleteMenuItem';
  import { MenuManager } from './menus/MenuManager';
  import { OpenAllInTabsMenuItem } from './menus/OpenAllInTabsMenuItem';
  import { PropertiesMenuItem } from './menus/PropertiesMenuItem';
  import { BookmarksManager } from './BookmarksManager';
  import ConfirmationDialog from './ConfirmationDialog.svelte';
  import { BOOKMARKS_ROOT_GUID } from './constants';
  import FilterInput from './FilterInput.svelte';
  import { FilterManager } from './FilterManager';
  import Folder from './Folder.svelte';
  import { HistoryManager } from './HistoryManager';
  import PageFooter from './PageFooter.svelte';
  import PageHeader from './PageHeader.svelte';
  import { PreferencesManager } from './PreferencesManager';
  import PropertiesDialog from './PropertiesDialog.svelte';
  import * as Treetop from './types';

  export let rootBookmarkId: string | null;

  //
  // Init preferences
  //

  const preferencesManager = new PreferencesManager();
  const showBookmarksToolbar = preferencesManager.createStore(
    'showBookmarksToolbar',
    true
  );
  const showBookmarksMenu = preferencesManager.createStore(
    'showBookmarksMenu',
    true
  );
  const showOtherBookmarks = preferencesManager.createStore(
    'showOtherBookmarks',
    true
  );
  const truncate = preferencesManager.createStore('truncate', true);
  const tooltips = preferencesManager.createStore('tooltips', true);
  const showRecentlyVisited = preferencesManager.createStore(
    'showRecentlyVisited',
    true
  );
  const colorScheme = preferencesManager.createStore('colorScheme', 'system');

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
  const filterSet: Treetop.FilterSet = writable(new Set());

  // Bookmarks manager
  const bookmarksManager = new BookmarksManager(nodeStoreMap);

  // History manager
  const historyManager = new HistoryManager(lastVisitTimeMap);

  // Filter manager
  const filterManager = new FilterManager(filterSet, nodeStoreMap);

  // Store for whether filter is active.
  const filterActive = writable(false);

  // Make bookmark data available to other components
  setContext('nodeStoreMap', nodeStoreMap);
  setContext('lastVisitTimeMap', lastVisitTimeMap);
  setContext('filterActive', filterActive);
  setContext('filterSet', filterSet);

  //
  // Error notification
  //

  let errorSnackbar: Snackbar;
  let errorMessage: string | null;

  //
  // Delete folder confirmation dialog
  //

  const deleteFolderDialogInfo = {
    shown: false,
    title: browser.i18n.getMessage('dialogHeadingDeleteFolder'),
    message: browser.i18n.getMessage('dialogMessageDeleteFolder'),
    cancelLabel: browser.i18n.getMessage('dialogButtonCancel'),
    confirmLabel: browser.i18n.getMessage('dialogButtonDelete'),
  };
  let deleteFolderId: string | null;

  //
  // Properties dialog
  //

  const propertiesDialogInfo = {
    shown: false,
  };
  let propertiesNode: browser.bookmarks.BookmarkTreeNode | null = null;

  //
  // Menu manager
  //

  let menuManager: MenuManager | null = null;

  // Body element
  let body: HTMLElement;

  // Manually update class for body element
  // See https://github.com/sveltejs/svelte/issues/3105
  $: if (body) {
    body.classList.remove('colorSchemeLight');
    body.classList.remove('colorSchemeDark');

    if ($colorScheme === 'light') {
      body.classList.add('colorSchemeLight');
    } else if ($colorScheme === 'dark') {
      body.classList.add('colorSchemeDark');
    }
  }

  /**
   * Show an error notification.
   */
  function handleError(err: Error | string) {
    errorMessage = err.toString();
    errorSnackbar.open();
  }

  /**
   * Open a folder's immediate children in tabs.
   */
  function openAllInTabs(nodeId: string) {
    const nodeStore = nodeStoreMap.get(nodeId)!;
    const node: Treetop.FolderNode = get(nodeStore);

    const promises: Promise<Tabs.Tab>[] = [];

    node.children.forEach((child) => {
      if (child.type === Treetop.NodeType.Bookmark) {
        promises.push(
          browser.tabs.create({
            url: child.url,
          })
        );
      }
    });

    Promise.all(promises).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorOpeningTab'));
    });
  }

  async function asyncShowPropertiesDialog(nodeId: string) {
    [propertiesNode] = await browser.bookmarks.get(nodeId);

    propertiesDialogInfo.shown = true;
  }

  /**
   * Show the properties dialog for a bookmark or folder.
   */
  function showPropertiesDialog(nodeId: string) {
    asyncShowPropertiesDialog(nodeId).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorRetrievingBookmark'));
    });
  }

  /**
   * Properties dialog cancel handler.
   */
  function cancelProperties() {
    propertiesDialogInfo.shown = false;
    propertiesNode = null;
  }

  /**
   * Properties dialog save handler.
   */
  async function saveProperties(event: CustomEvent<Treetop.PropertiesChanges>) {
    propertiesDialogInfo.shown = false;

    const changes = event.detail;

    try {
      await browser.bookmarks.update(propertiesNode!.id, changes);
    } catch (err) {
      console.error(err);
      handleError(browser.i18n.getMessage('errorSavingBookmark'));
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
        browser.bookmarks.remove(nodeId).catch((err) => {
          console.error(err);
          handleError(browser.i18n.getMessage('errorDeletingFolder'));
        });
      } else {
        deleteFolderId = nodeId;
        deleteFolderDialogInfo.shown = true;
      }
    } else {
      // Bookmark
      browser.bookmarks.remove(nodeId).catch((err) => {
        console.error(err);
        handleError(browser.i18n.getMessage('errorDeletingBookmark'));
      });
    }
  }

  /**
   * Delete folder confirmation dialog cancel handler.
   */
  function cancelDeleteBookmark() {
    deleteFolderDialogInfo.shown = false;
    deleteFolderId = null;
  }

  /**
   * Delete folder confirmation dialog confirm handler.
   */
  function confirmDeleteBookmark() {
    deleteFolderDialogInfo.shown = false;
    browser.bookmarks.removeTree(deleteFolderId!).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorDeletingFolder'));
    });
    deleteFolderId = null;
  }

  /**
   * Reload when hash changes to update for new root bookmark node.
   */
  function onHashChange() {
    window.location.reload();
  }

  //
  // Bookmark event handlers
  //

  async function asyncOnBookmarkCreated(
    id: string,
    bookmark: browser.bookmarks.BookmarkTreeNode
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
    bookmark: browser.bookmarks.BookmarkTreeNode
  ) {
    asyncOnBookmarkCreated(id, bookmark).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorHandlingBookmarkCreation'));
    });
  }

  async function asyncOnBookmarkRemoved(
    id: string,
    removeInfo: browser.bookmarks._OnRemovedRemoveInfo
  ) {
    const removedNodeIds = await bookmarksManager.handleBookmarkRemoved(
      id,
      removeInfo
    );

    filterManager.beginBatchRemove();
    removedNodeIds.forEach((nodeId) =>
      filterManager.handleBookmarkRemoved(nodeId)
    );
    filterManager.endBatchRemove();

    if ($showRecentlyVisited) {
      removedNodeIds.forEach((nodeId) =>
        historyManager.handleBookmarkRemoved(nodeId)
      );
    }
  }

  function onBookmarkRemoved(
    id: string,
    removeInfo: browser.bookmarks._OnRemovedRemoveInfo
  ) {
    asyncOnBookmarkRemoved(id, removeInfo).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorHandlingBookmarkRemoval'));
    });
  }

  async function asyncOnBookmarkChanged(
    id: string,
    changeInfo: browser.bookmarks._OnChangedChangeInfo
  ) {
    await bookmarksManager.handleBookmarkChanged(id, changeInfo);

    filterManager.handleBookmarkChanged(id, changeInfo);

    if ($showRecentlyVisited) {
      await historyManager.handleBookmarkChanged(id, changeInfo);
    }
  }

  function onBookmarkChanged(
    id: string,
    changeInfo: browser.bookmarks._OnChangedChangeInfo
  ) {
    asyncOnBookmarkChanged(id, changeInfo).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorHandlingBookmarkChange'));
    });
  }

  async function asyncOnBookmarkMoved(
    id: string,
    moveInfo: browser.bookmarks._OnMovedMoveInfo
  ) {
    await bookmarksManager.handleBookmarkMoved(id, moveInfo);

    filterManager.handleBookmarkMoved(id, moveInfo);
  }

  function onBookmarkMoved(
    id: string,
    moveInfo: browser.bookmarks._OnMovedMoveInfo
  ) {
    asyncOnBookmarkMoved(id, moveInfo).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorHandlingBookmarkMove'));
    });
  }

  //
  // History event handlers
  //

  async function asyncOnVisited(result: browser.history.HistoryItem) {
    if ($showRecentlyVisited) {
      await historyManager.handleVisited(result);
    }
  }

  function onVisited(result: browser.history.HistoryItem) {
    asyncOnVisited(result).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorHandlingHistoryVisit'));
    });
  }

  async function asyncOnVisitRemoved(
    removed: browser.history._OnVisitRemovedRemoved
  ) {
    if ($showRecentlyVisited) {
      await historyManager.handleVisitRemoved(removed);
    }
  }

  function onVisitRemoved(removed: browser.history._OnVisitRemovedRemoved) {
    asyncOnVisitRemoved(removed).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorHandlingHistoryVisitRemoval'));
    });
  }

  //
  // Menu event handlers
  //

  async function asyncOnMenuShown(
    info: browser.menus._OnShownInfo,
    tab: browser.tabs.Tab
  ) {
    await menuManager?.handleMenuShown(info, tab);
  }

  function onMenuShown(
    info: browser.menus._OnShownInfo,
    tab: browser.tabs.Tab
  ) {
    asyncOnMenuShown(info, tab).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorHandlingMenuShown'));
    });
  }

  function onMenuHidden() {
    menuManager?.handleMenuHidden();
  }

  async function asyncOnMenuClicked(
    info: browser.menus.OnClickData,
    tab?: browser.tabs.Tab
  ) {
    await menuManager?.handleMenuClicked(info, tab);
  }

  function onMenuClicked(
    info: browser.menus.OnClickData,
    tab?: browser.tabs.Tab
  ) {
    asyncOnMenuClicked(info, tab).catch((err) => {
      console.error(err);
      handleError(browser.i18n.getMessage('errorHandlingMenuClick'));
    });
  }

  //
  // Filter input event handler
  //

  /**
   * Apply the current filter string.
   */
  function applyFilter(event: CustomEvent<{ filter: string }>) {
    // Clear any previous filtering
    filterManager.clearFilter();
    filterActive.set(false);

    // Set the current filter if the string is not empty
    const value = event.detail.filter.trim();
    if (value && value.length > 0) {
      filterManager.setFilter(value);
      filterActive.set(true);
    }
  }

  /**
   * Initialize page.
   * Return validated root bookmark ID.
   */
  async function init() {
    try {
      await preferencesManager.loadPreferences();
    } catch (err) {
      console.error(err);
      handleError(browser.i18n.getMessage('errorLoadingPreferences'));
    }

    // Configure bookmarks manager
    bookmarksManager.showBookmarksToolbar = $showBookmarksToolbar as boolean;
    bookmarksManager.showBookmarksMenu = $showBookmarksMenu as boolean;
    bookmarksManager.showOtherBookmarks = $showOtherBookmarks as boolean;

    // Register bookmark event handlers
    browser.bookmarks.onCreated.addListener(onBookmarkCreated);
    browser.bookmarks.onRemoved.addListener(onBookmarkRemoved);
    browser.bookmarks.onChanged.addListener(onBookmarkChanged);
    browser.bookmarks.onMoved.addListener(onBookmarkMoved);

    // Register history event handlers
    browser.history.onVisited.addListener(onVisited);
    browser.history.onVisitRemoved.addListener(onVisitRemoved);

    // Load bookmarks
    try {
      await bookmarksManager.loadBookmarks();
    } catch (err) {
      console.error(err);
      handleError(browser.i18n.getMessage('errorLoadingBookmarks'));
    }

    // Load history
    try {
      historyManager.init(nodeStoreMap);
      if ($showRecentlyVisited) {
        await historyManager.loadHistory(nodeStoreMap);
      }
    } catch (err) {
      console.error(err);
      handleError(browser.i18n.getMessage('errorLoadingHistory'));
    }

    // Initialize or reset history manager when 'showRecentlyVisited' preference changes
    unsubscribeShowRecentlyVisited = showRecentlyVisited.subscribe((value) => {
      if (value) {
        historyManager.loadHistory(nodeStoreMap).catch((err) => {
          console.error(err);
          handleError(browser.i18n.getMessage('errorLoadingHistory'));
        });
      } else {
        historyManager.unloadHistory();
      }
    });

    // Validate specified root bookmark ID, falling back to bookmarks root
    if (!rootBookmarkId || !nodeStoreMap.has(rootBookmarkId)) {
      rootBookmarkId = BOOKMARKS_ROOT_GUID;
    }

    return rootBookmarkId;
  }

  onMount(() => {
    // Get body element
    body = document.body;

    // Register menu event handlers
    // @ts-expect-error: See https://github.com/jsmnbom/definitelytyped-firefox-webext-browser/pull/37
    browser.menus.onShown.addListener(onMenuShown);
    browser.menus.onHidden.addListener(onMenuHidden);
    browser.menus.onClicked.addListener(onMenuClicked);

    // Initialize menu manager
    menuManager = new MenuManager();
    menuManager.registerMenuItem('delete', new DeleteMenuItem(deleteBookmark));
    menuManager.registerMenuItem(
      'openAllInTabs',
      new OpenAllInTabsMenuItem(nodeStoreMap, openAllInTabs)
    );
    menuManager.registerMenuItem(
      'properties',
      new PropertiesMenuItem(showPropertiesDialog)
    );

    window.addEventListener('hashchange', onHashChange);
  });

  onDestroy(() => {
    // Unsubscribe from the 'showRecentlyVisited' option
    unsubscribeShowRecentlyVisited();

    // Unregister menu event handlers
    // @ts-expect-error: See https://github.com/jsmnbom/definitelytyped-firefox-webext-browser/pull/37
    browser.menus.onShown.removeListener(onMenuShown);
    browser.menus.onHidden.removeListener(onMenuHidden);
    browser.menus.onClicked.removeListener(onMenuClicked);

    // Destroy menu manager
    menuManager = null;

    window.removeEventListener('hashchange', onHashChange);
  });

  // Initialize Treetop
  let ready = init();
</script>

<style>
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

{#await ready}
  <div class="progressContainer">
    <img src={icon} alt="Treetop Icon" />
    <div class="progress">
      <LinearProgress indeterminate />
    </div>
  </div>
{:then rootNodeId}
  <PageHeader
    on:error={() => {
      handleError(browser.i18n.getMessage('errorLoadingPreferences'));
    }}>
    <FilterInput on:input={applyFilter} />
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
    on:cancel={cancelDeleteBookmark}
    on:confirm={confirmDeleteBookmark} />

  <!-- Bookmark properties dialog -->
  <PropertiesDialog
    {...propertiesDialogInfo}
    title={propertiesNode ? propertiesNode.title : ''}
    url={propertiesNode ? propertiesNode.url : ''}
    on:cancel={cancelProperties}
    on:save={saveProperties} />
{/await}

<!-- Error notification -->
<Snackbar bind:this={errorSnackbar} leading labelText={errorMessage}>
  <Label />
</Snackbar>
