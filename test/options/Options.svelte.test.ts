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
      .expect('optionHeadingBookmarks')
      .andReturn('bookmarks');
    mockBrowser.i18n.getMessage
      .expect('optionHeadingAppearance')
      .andReturn('appearance');
    mockBrowser.i18n.getMessage
      .expect('optionTruncateLongTitles')
      .andReturn('truncate');
    mockBrowser.i18n.getMessage
      .expect('optionDisplayTooltips')
      .andReturn('tooltips');
    mockBrowser.i18n.getMessage
      .expect('optionShowRecentlyVisited')
      .andReturn('show recently visited');
    mockBrowser.i18n.getMessage
      .expect('optionColorScheme')
      .andReturn('color scheme');
    mockBrowser.i18n.getMessage
      .expect('optionColorSchemeLight')
      .andReturn('light');
    mockBrowser.i18n.getMessage
      .expect('optionColorSchemeDark')
      .andReturn('dark');
    mockBrowser.i18n.getMessage
      .expect('openSourceAttributions')
      .andReturn('attributions');

    mockBrowser.storage.local.get.expect.andResolve({
      truncate: false,
      tooltips: true,
      showRecentlyVisited: true,
      colorScheme: 'light',
    });
  });

  it('renders', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText(/^bookmarks/i)).toBeInTheDocument();
      expect(screen.getByText(/^appearance/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^truncate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^tooltips/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/^show recently visited/i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/^light/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^dark/i)).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /^attributions$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /^attributions$/i }),
      ).toHaveAttribute('href', expect.stringMatching(/^attributions\.txt$/));
    });
  });

  it('initializes preferences from storage', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText(/^bookmarks/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/^truncate/i)).not.toBeChecked();
    expect(screen.getByLabelText(/^tooltips/i)).toBeChecked();
    expect(screen.getByLabelText(/^show recently visited/i)).toBeChecked();
    expect(screen.getByLabelText(/^light/i)).toBeChecked();
    expect(screen.getByLabelText(/^dark/i)).not.toBeChecked();
  });

  describe('updates storage when preference changes', () => {
    beforeEach(() => {
      setup();
    });

    it('checkbox', async () => {
      const truncate = screen.getByLabelText(/^truncate/i);

      await waitFor(() => {
        expect(truncate).not.toBeChecked();
      });

      // Enable truncate
      mockBrowser.storage.local.set.expect({ truncate: true });
      await fireEvent.click(truncate);
      await waitFor(() => {
        expect(truncate).toBeChecked();
      });

      // Disable truncate
      mockBrowser.storage.local.set.expect({ truncate: false });
      await fireEvent.click(truncate);
      await waitFor(() => {
        expect(truncate).not.toBeChecked();
      });
    });

    it('radio button', async () => {
      const light = screen.getByLabelText(/^light/i);
      const dark = screen.getByLabelText(/^dark/i);

      await waitFor(() => {
        expect(light).toBeChecked();
        expect(dark).not.toBeChecked();
      });

      // Enable dark
      mockBrowser.storage.local.set.expect({ colorScheme: 'dark' });
      await fireEvent.click(dark);
      await waitFor(() => {
        expect(light).not.toBeChecked();
        expect(dark).toBeChecked();
      });

      // Enable light
      mockBrowser.storage.local.set.expect({ colorScheme: 'light' });
      await fireEvent.click(light);
      await waitFor(() => {
        expect(light).toBeChecked();
        expect(dark).not.toBeChecked();
      });
    });
  });
});
