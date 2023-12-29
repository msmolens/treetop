import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Options from '@Treetop/options/Options.svelte';

import ContextWrapper from '../../test/utils/ContextWrapper.svelte';

const setup = () => {
  render(ContextWrapper, {
    Component: Options,
    Props: {},
    Context: {},
  });
};

describe('Options', () => {
  beforeEach(() => {
    vi.spyOn(chrome.i18n, 'getMessage').mockImplementation((messageName) => {
      switch (messageName) {
        case 'optionHeadingGeneral':
          return 'general';
        case 'optionHeadingBookmarks':
          return 'bookmarks';
        case 'optionHeadingAppearance':
          return 'appearance';
        case 'optionOpenInNewTab':
          return 'open in new tab';
        case 'optionTruncateLongTitles':
          return 'truncate';
        case 'optionDisplayTooltips':
          return 'tooltips';
        case 'optionShowRecentlyVisited':
          return 'show recently visited';
        case 'optionColorScheme':
          return 'color scheme';
        case 'optionColorSchemeLight':
          return 'light';
        case 'optionColorSchemeDark':
          return 'dark';
        case 'openSourceAttributions':
          return 'attributions';
        default:
          throw new Error(`Unhandled message name: '${messageName}'`);
          break;
      }
    });

    afterEach(() => {
      cleanup();
    });

    const get = vi.fn().mockResolvedValue({
      openInNewTab: true,
      truncate: false,
      tooltips: true,
      showRecentlyVisited: true,
      colorScheme: 'light',
    });
    vi.spyOn(chrome.storage.local, 'get').mockImplementation(get);
  });

  it('renders', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText(/^general/i)).toBeInTheDocument();
      expect(screen.getByText(/^bookmarks/i)).toBeInTheDocument();
      expect(screen.getByText(/^appearance/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^open in new tab/i)).toBeInTheDocument();
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
      expect(screen.getByText(/^general/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/^open in new tab/i)).toBeChecked();
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
      const truncate = await screen.findByLabelText(/^truncate/i);

      await waitFor(() => {
        expect(truncate).not.toBeChecked();
      });

      // Enable truncate
      {
        const set = vi.fn();
        vi.spyOn(chrome.storage.local, 'set').mockImplementation(set);

        await fireEvent.click(truncate);
        await waitFor(() => {
          expect(truncate).toBeChecked();
        });
        expect(set).toHaveBeenCalledOnce();
        expect(set).toHaveBeenCalledWith({ truncate: true });
      }

      // Disable truncate
      {
        const set = vi.fn();
        vi.spyOn(chrome.storage.local, 'set').mockImplementation(set);

        await fireEvent.click(truncate);
        await waitFor(() => {
          expect(truncate).not.toBeChecked();
        });
        expect(set).toHaveBeenCalledOnce();
        expect(set).toHaveBeenCalledWith({ truncate: false });
      }
    });

    it('radio button', async () => {
      const light = await screen.findByLabelText(/^light/i);
      const dark = await screen.findByLabelText(/^dark/i);

      await waitFor(() => {
        expect(light).toBeChecked();
        expect(dark).not.toBeChecked();
      });

      // Enable dark
      {
        const set = vi.fn();
        vi.spyOn(chrome.storage.local, 'set').mockImplementation(set);

        await fireEvent.click(dark);
        await waitFor(() => {
          expect(light).not.toBeChecked();
          expect(dark).toBeChecked();
        });
        expect(set).toHaveBeenCalledOnce();
        expect(set).toHaveBeenCalledWith({ colorScheme: 'dark' });
      }

      // Enable light
      {
        const set = vi.fn();
        vi.spyOn(chrome.storage.local, 'set').mockImplementation(set);

        await fireEvent.click(light);
        await waitFor(() => {
          expect(light).toBeChecked();
          expect(dark).not.toBeChecked();
        });
        expect(set).toHaveBeenCalledOnce();
        expect(set).toHaveBeenCalledWith({ colorScheme: 'light' });
      }
    });
  });
});
