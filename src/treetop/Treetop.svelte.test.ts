/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
  afterEach(() => {
    cleanup();
  });

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

    // Delete folder confirmation dialog
    expect(getMessage).toHaveBeenNthCalledWith(1, 'dialogHeadingDeleteFolder');
    expect(getMessage).toHaveBeenNthCalledWith(2, 'dialogMessageDeleteFolder');
    expect(getMessage).toHaveBeenNthCalledWith(3, 'dialogButtonCancel');
    expect(getMessage).toHaveBeenNthCalledWith(4, 'dialogButtonDelete');

    // Page header
    expect(getMessage).toHaveBeenNthCalledWith(5, 'search');
    expect(getMessage).toHaveBeenNthCalledWith(6, 'preferences');

    // Properties dialog
    expect(getMessage).toHaveBeenNthCalledWith(7, 'dialogButtonCancel');
    expect(getMessage).toHaveBeenNthCalledWith(8, 'dialogButtonSave');

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

    // Expect all bookmark root folders to be empty
    for (let i = 0; i < numEmptyFolders; i++) {
      expect(getMessage).toHaveBeenNthCalledWith(9 + i, 'emptyFolder');
    }

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
