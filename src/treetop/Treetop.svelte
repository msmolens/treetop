<script lang="ts">
  import * as Treetop from './types';
  import { browser } from 'webextension-polyfill-ts';

  import { onMount, onDestroy, setContext } from 'svelte';
  import { get } from 'svelte/store';
  import { fade } from 'svelte/transition';
  import LinearProgress from '@smui/linear-progress';
  import Snackbar, { Label } from '@smui/snackbar';

  import icon from '../icons/generated/icons/icon.svg';

  import Folder from './Folder.svelte';
  import PageFooter from './PageFooter.svelte';
  import PageHeader from './PageHeader.svelte';

  import { BookmarksManager } from './BookmarksManager';
  import ConfirmationDialog from './ConfirmationDialog.svelte';
  import { HistoryManager } from './HistoryManager';
  import { PreferencesManager } from './PreferencesManager';
  import PropertiesDialog from './PropertiesDialog.svelte';

  import { MenuManager } from './menus/MenuManager';
  import { DeleteMenuItem } from './menus/DeleteMenuItem';
  import { OpenAllInTabsMenuItem } from './menus/OpenAllInTabsMenuItem';
  import { PropertiesMenuItem } from './menus/PropertiesMenuItem';

  import { BOOKMARKS_ROOT_GUID } from './constants';

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

  // Make select preferences available to other components
  setContext('truncate', truncate);
  setContext('tooltips', tooltips);

  // Function to unsubscribe from the 'showRecentlyVisited' preference
  let unsubscribeShowRecentlyVisited: Treetop.SvelteStoreUnsubscriber;

  //
  // Create bookmarks data and manager
  //

  // ID to node store map.
  // Populated with a store for each folder.
  const nodeStoreMap: Treetop.NodeStoreMap = new Map();

  // ID to last visit time map.
  // Populated with a store for each bookmark.
  const lastVisitTimeMap: Treetop.LastVisitTimeMap = new Map();

  // Bookmarks manager
  const bookmarksManager = new BookmarksManager(nodeStoreMap);

  // History manager
  const historyManager = new HistoryManager(lastVisitTimeMap);

  // Make bookmark node and history data available to other components
  setContext('nodeStoreMap', nodeStoreMap);
  setContext('lastVisitTimeMap', lastVisitTimeMap);

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

    node.children.forEach((child) => {
      if (child.type === Treetop.NodeType.Bookmark) {
        browser.tabs.create({
          url: child.url,
        });
      }
    });
  }

  /**
   * Show the properties dialog for a bookmark or folder.
   */
  async function showPropertiesDialog(nodeId: string) {
    try {
      [propertiesNode] = await browser.bookmarks.get(nodeId);
    } catch (err) {
      console.error(err);
      handleError(browser.i18n.getMessage('errorRetrievingBookmark'));
    }

    propertiesDialogInfo.shown = true;
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
      const node = get(nodeStore) as Treetop.FolderNode;
      if (node.children.length === 0) {
        browser.bookmarks.remove(nodeId);
      } else {
        deleteFolderId = nodeId;
        deleteFolderDialogInfo.shown = true;
      }
    } else {
      // Bookmark
      browser.bookmarks.remove(nodeId);
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
    browser.bookmarks.removeTree(deleteFolderId!);
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

  function onBookmarkCreated(
    id: string,
    bookmark: browser.bookmarks.BookmarkTreeNode
  ) {
    bookmarksManager.handleBookmarkCreated(id, bookmark);

    if ($showRecentlyVisited) {
      historyManager.handleBookmarkCreated(id, bookmark);
    }
  }

  async function onBookmarkRemoved(
    id: string,
    removeInfo: browser.bookmarks._OnRemovedRemoveInfo
  ) {
    const removedNodeIds = await bookmarksManager.handleBookmarkRemoved(
      id,
      removeInfo
    );

    if ($showRecentlyVisited) {
      removedNodeIds.forEach((nodeId) =>
        historyManager.handleBookmarkRemoved(nodeId)
      );
    }
  }

  function onBookmarkChanged(
    id: string,
    changeInfo: browser.bookmarks._OnChangedChangeInfo
  ) {
    bookmarksManager.handleBookmarkChanged(id, changeInfo);

    if ($showRecentlyVisited) {
      historyManager.handleBookmarkChanged(id, changeInfo);
    }
  }

  function onBookmarkMoved(
    id: string,
    moveInfo: browser.bookmarks._OnMovedMoveInfo
  ) {
    bookmarksManager.handleBookmarkMoved(id, moveInfo);
  }

  //
  // History event handlers
  //

  function onVisited(result: browser.history.HistoryItem) {
    if ($showRecentlyVisited) {
      historyManager.handleVisited(result);
    }
  }

  function onVisitRemoved(removed: browser.history._OnVisitRemovedRemoved) {
    if ($showRecentlyVisited) {
      historyManager.handleVisitRemoved(removed);
    }
  }

  //
  // Menu event handlers
  //

  async function onMenuShown(
    info: browser.menus._OnShownInfo,
    tab: browser.tabs.Tab
  ) {
    return menuManager?.handleMenuShown(info, tab);
  }

  function onMenuHidden() {
    menuManager?.handleMenuHidden();
  }

  async function onMenuClicked(
    info: browser.menus.OnClickData,
    tab?: browser.tabs.Tab
  ) {
    return menuManager?.handleMenuClicked(info, tab);
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
        try {
          historyManager.loadHistory(nodeStoreMap);
        } catch (err) {
          console.error(err);
          handleError(browser.i18n.getMessage('errorLoadingHistory'));
        }
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
  <PageHeader />
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
