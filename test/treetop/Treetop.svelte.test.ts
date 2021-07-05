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
    mockBrowser.storage.onChanged.addListener.expect(expect.anything());

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
    mockBrowser.menus.onShown.addListener.expect(expect.anything());
    mockBrowser.menus.onHidden.addListener.expect(expect.anything());
    mockBrowser.menus.onClicked.addListener.expect(expect.anything());

    //
    // init()
    //

    // Load preferences
    mockBrowser.storage.local.get.expect.andResolve({});

    // Bookmark event handlers
    mockBrowser.bookmarks.onCreated.addListener.expect(expect.anything());
    mockBrowser.bookmarks.onRemoved.addListener.expect(expect.anything());
    mockBrowser.bookmarks.onChanged.addListener.expect(expect.anything());
    mockBrowser.bookmarks.onMoved.addListener.expect(expect.anything());

    // History event handlers
    mockBrowser.history.onVisited.addListener.expect(expect.anything());
    mockBrowser.history.onVisitRemoved.addListener.expect(expect.anything());

    // Load bookmarks
    const bookmarksTree = createBrowserBookmarksTree();
    bookmarksTree[0].title = 'Bookmarks root';
    mockBrowser.bookmarks.getTree.expect.andResolve(bookmarksTree);

    // Expect all bookmark root folders, excluding Mobile Bookmarks, to be empty
    const numEmptyFolders = bookmarksTree[0].children!.length - 1;
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

    mockBrowser.menus.onShown.removeListener.expect(expect.anything());
    mockBrowser.menus.onHidden.removeListener.expect(expect.anything());
    mockBrowser.menus.onClicked.removeListener.expect(expect.anything());

    cleanup();
  });
});

// TODO: Improve testability of Treetop component
