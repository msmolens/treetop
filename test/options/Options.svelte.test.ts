import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';

import Options from '@Treetop/options/Options.svelte';

import ContextWrapper from '../utils/ContextWrapper.svelte';

const setup = () => {
  render(ContextWrapper, {
    Component: Options,
    Props: {},
    Context: {},
  });
};

describe('Options', () => {
  beforeEach(() => {
    mockBrowser.i18n.getMessage
      .expect('optionHeadingGeneral')
      .andReturn('general');
    mockBrowser.i18n.getMessage
      .expect('optionHeadingBookmarks')
      .andReturn('bookmarks');
    mockBrowser.i18n.getMessage
      .expect('optionShowBookmarksToolbar')
      .andReturn('show bookmarks toolbar');
    mockBrowser.i18n.getMessage
      .expect('optionShowBookmarksMenu')
      .andReturn('show bookmarks menu');
    mockBrowser.i18n.getMessage
      .expect('optionShowOtherBookmarks')
      .andReturn('show other bookmarks');
    mockBrowser.i18n.getMessage
      .expect('optionTruncateLongTitles')
      .andReturn('truncate');
    mockBrowser.i18n.getMessage
      .expect('optionDisplayTooltips')
      .andReturn('tooltips');
    mockBrowser.i18n.getMessage
      .expect('optionShowRecentlyVisited')
      .andReturn('show recently visited');

    mockBrowser.storage.local.get.expect.andResolve({
      showBookmarksToolbar: true,
      showBookmarksMenu: false,
      showOtherBookmarks: true,
      truncate: false,
      tooltips: true,
      showRecentlyVisited: true,
    });
  });

  it('renders', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText(/^general/i)).toBeInTheDocument();
      expect(screen.getByText(/^bookmarks/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/^show bookmarks toolbar/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/^show bookmarks menu/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/^show other bookmarks/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/^truncate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^tooltips/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/^show recently visited/i)
      ).toBeInTheDocument();
    });
  });

  it('initializes preferences from storage', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText(/^general/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/^show bookmarks toolbar/i)).toBeChecked();
    expect(screen.getByLabelText(/^show bookmarks menu/i)).not.toBeChecked();
    expect(screen.getByLabelText(/^show other bookmarks/i)).toBeChecked();
    expect(screen.getByLabelText(/^truncate/i)).not.toBeChecked();
    expect(screen.getByLabelText(/^tooltips/i)).toBeChecked();
    expect(screen.getByLabelText(/^show recently visited/i)).toBeChecked();
  });

  it('updates storage when preference changes', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByLabelText(/^truncate/i)).not.toBeChecked();
    });

    const truncate = screen.getByLabelText(/^truncate/i);

    // Enable truncate
    mockBrowser.storage.local.set.expect({ truncate: true });
    await fireEvent.click(truncate);
    await waitFor(() => {
      expect(screen.getByLabelText(/^truncate/i)).toBeChecked();
    });

    // Disable truncate
    mockBrowser.storage.local.set.expect({ truncate: false });
    await fireEvent.click(truncate);
    await waitFor(() => {
      expect(screen.getByLabelText(/^truncate/i)).not.toBeChecked();
    });
  });
});
