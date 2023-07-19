import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import PageHeader from '@Treetop/treetop/PageHeader.svelte';

const setup = () => {
  return {
    user: userEvent.setup(),
    ...render(PageHeader),
  };
};

beforeEach(() => {
  mockBrowser.i18n.getMessage.expect('preferences');
});

it('renders page header', () => {
  setup();

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

  mockBrowser.runtime.openOptionsPage.expect().andResolve();

  await user.click(button);
});
