import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Treetop from '@Treetop/treetop/Treetop.svelte';

import ContextWrapper from '../../test/utils/ContextWrapper.svelte';
import { createBrowserBookmarksTree } from '../../test/utils/factories';

const setup = () => {
  render(ContextWrapper, {
    Component: Treetop,
    Props: {
      rootBookmarkId: null,
    },
    Context: {},
  });
};

describe('Treetop', () => {
  it('renders', async () => {
    //
    // Instantiation
    //

    // Preferences manager
    const storageOnChangedAddListener = vi.fn();
    vi.spyOn(chrome.storage.onChanged, 'addListener').mockImplementation(
      storageOnChangedAddListener,
    );

    // Delete folder confirmation dialog
    const getMessage = vi.fn();
    vi.spyOn(chrome.i18n, 'getMessage').mockImplementation(getMessage);

    //
    // onMount
    //

    // Menu event handlers
    const contextMenusOnClickedAddListener = vi.fn();
    vi.spyOn(chrome.contextMenus.onClicked, 'addListener').mockImplementation(
      contextMenusOnClickedAddListener,
    );

    //
    // init()
    //

    // Load preferences
    const getLocalStorage = vi.fn().mockResolvedValue({});
    vi.spyOn(chrome.storage.local, 'get').mockImplementation(getLocalStorage);

    // Bookmark event handlers
    const bookmarksOnCreatedAddListener = vi.fn();
    vi.spyOn(chrome.bookmarks.onCreated, 'addListener').mockImplementation(
      bookmarksOnCreatedAddListener,
    );
    const bookmarksOnRemovedAddListener = vi.fn();
    vi.spyOn(chrome.bookmarks.onRemoved, 'addListener').mockImplementation(
      bookmarksOnRemovedAddListener,
    );
    const bookmarksOnChangedAddListener = vi.fn();
    vi.spyOn(chrome.bookmarks.onChanged, 'addListener').mockImplementation(
      bookmarksOnChangedAddListener,
    );
    const bookmarksOnMovedAddListener = vi.fn();
    vi.spyOn(chrome.bookmarks.onMoved, 'addListener').mockImplementation(
      bookmarksOnMovedAddListener,
    );

    // History event handlers
    const historyOnVisitedAddListener = vi.fn();
    vi.spyOn(chrome.history.onVisited, 'addListener').mockImplementation(
      historyOnVisitedAddListener,
    );
    const historyOnVisitRemovedAddListener = vi.fn();
    vi.spyOn(chrome.history.onVisitRemoved, 'addListener').mockImplementation(
      historyOnVisitRemovedAddListener,
    );

    // Load bookmarks
    const bookmarksTree = createBrowserBookmarksTree();
    bookmarksTree[0].title = 'Bookmarks root';
    const getTree = vi.fn().mockResolvedValue(bookmarksTree);
    vi.spyOn(chrome.bookmarks, 'getTree').mockImplementation(getTree);

    const numEmptyFolders = bookmarksTree[0].children!.length;

    setup();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Preferences manager
    expect(storageOnChangedAddListener).toHaveBeenCalledOnce();

    expect(getMessage).toHaveBeenCalledTimes(8 + numEmptyFolders);

    // Folder contents
    expect(getMessage).toHaveBeenCalledWith('emptyFolder');

    // Delete folder confirmation dialog
    expect(getMessage).toHaveBeenCalledWith('dialogHeadingDeleteFolder');
    expect(getMessage).toHaveBeenCalledWith('dialogMessageDeleteFolder');
    expect(getMessage).toHaveBeenCalledWith('dialogButtonCancel');
    expect(getMessage).toHaveBeenCalledWith('dialogButtonDelete');

    // Page header
    expect(getMessage).toHaveBeenCalledWith('search');
    expect(getMessage).toHaveBeenCalledWith('preferences');

    // Properties dialog
    expect(getMessage).toHaveBeenCalledWith('dialogButtonCancel');
    expect(getMessage).toHaveBeenCalledWith('dialogButtonSave');

    //
    // onMount
    //

    // Menu event handlers
    expect(contextMenusOnClickedAddListener).toHaveBeenCalledOnce();

    //
    // init()
    //

    // Load preferences
    expect(getLocalStorage).toHaveBeenCalledOnce();

    // Bookmark event handlers
    expect(bookmarksOnCreatedAddListener).toHaveBeenCalledOnce();
    expect(bookmarksOnRemovedAddListener).toHaveBeenCalledOnce();
    expect(bookmarksOnChangedAddListener).toHaveBeenCalledOnce();
    expect(bookmarksOnMovedAddListener).toHaveBeenCalledOnce();

    // History event handlers
    expect(historyOnVisitedAddListener).toHaveBeenCalledOnce();
    expect(historyOnVisitRemovedAddListener).toHaveBeenCalledOnce();

    //
    // onDestroy
    //

    const contextMenusOnClickedRemoveListener = vi.fn();
    vi.spyOn(
      chrome.contextMenus.onClicked,
      'removeListener',
    ).mockImplementation(contextMenusOnClickedRemoveListener);
  });
});

// TODO: Improve testability of Treetop component
