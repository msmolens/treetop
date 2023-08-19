/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { cleanup, render, screen, waitFor } from '@testing-library/svelte';

import Treetop from '@Treetop/treetop/Treetop.svelte';

import ContextWrapper from '../utils/ContextWrapper.svelte';
import { createBrowserBookmarksTree } from '../utils/factories';

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
    mockBrowser.storage.onChanged.addListener.expect(expect.any(Function));

    // Delete folder confirmation dialog
    mockBrowser.i18n.getMessage.expect('dialogHeadingDeleteFolder');
    mockBrowser.i18n.getMessage.expect('dialogMessageDeleteFolder');
    mockBrowser.i18n.getMessage.expect('dialogButtonCancel');
    mockBrowser.i18n.getMessage.expect('dialogButtonDelete');

    // Page header
    mockBrowser.i18n.getMessage.expect('search');
    mockBrowser.i18n.getMessage.expect('preferences');

    // Properties dialog
    mockBrowser.i18n.getMessage.expect('dialogButtonCancel');
    mockBrowser.i18n.getMessage.expect('dialogButtonSave');

    //
    // onMount
    //

    // Menu event handlers
    mockBrowser.contextMenus.onClicked.addListener.expect(expect.any(Function));

    //
    // init()
    //

    // Load preferences
    mockBrowser.storage.local.get.expect.andResolve({});

    // Bookmark event handlers
    mockBrowser.bookmarks.onCreated.addListener.expect(expect.any(Function));
    mockBrowser.bookmarks.onRemoved.addListener.expect(expect.any(Function));
    mockBrowser.bookmarks.onChanged.addListener.expect(expect.any(Function));
    mockBrowser.bookmarks.onMoved.addListener.expect(expect.any(Function));

    // History event handlers
    mockBrowser.history.onVisited.addListener.expect(expect.any(Function));
    mockBrowser.history.onVisitRemoved.addListener.expect(expect.any(Function));

    // Load bookmarks
    const bookmarksTree = createBrowserBookmarksTree();
    bookmarksTree[0].title = 'Bookmarks root';
    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);

    // Expect all bookmark root folders to be empty
    const numEmptyFolders = bookmarksTree[0].children!.length;
    mockBrowser.i18n.getMessage.expect('emptyFolder').times(numEmptyFolders);

    setup();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('banner')).toBeInTheDocument();

    //
    // onDestroy
    //

    mockBrowser.contextMenus.onClicked.removeListener.expect(
      expect.any(Function),
    );

    cleanup();
  });
});

// TODO: Improve testability of Treetop component
