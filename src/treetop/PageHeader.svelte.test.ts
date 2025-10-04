import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { MockInstance } from 'vitest';
import { beforeEach, expect, it, vi } from 'vitest';

import PageHeader from '@Treetop/treetop/PageHeader.svelte';

const setup = () => {
  return {
    user: userEvent.setup(),
    ...render(PageHeader),
  };
};

let getMessage: MockInstance;

beforeEach(() => {
  getMessage = vi
    .spyOn(chrome.i18n, 'getMessage')
    .mockReturnValue('Preferences');
});

it('renders page header', () => {
  setup();

  expect(getMessage).toHaveBeenCalledOnce();
  expect(getMessage).toHaveBeenCalledWith('preferences');

  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();

  expect(screen.getByRole('banner')).toHaveTextContent('Treetop');
  expect(screen.getByRole('button', { hidden: true })).toHaveTextContent(
    'settings',
  );
});

it('logo contents', () => {
  setup();

  const logo = screen.getByRole('banner');
  expect(logo).toHaveTextContent('Treetop');
});

it('preferences button', async () => {
  const { user } = setup();

  const button = screen.getByRole('button', { hidden: true });
  expect(button).toHaveTextContent('settings');

  const openOptionsPage = vi.fn().mockResolvedValue(vi.fn());
  vi.spyOn(chrome.runtime, 'openOptionsPage').mockImplementation(
    openOptionsPage,
  );

  await user.click(button);

  expect(openOptionsPage).toHaveBeenCalledOnce();
});
