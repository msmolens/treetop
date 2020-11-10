import { render, screen } from '@testing-library/svelte';

import PageFooter from '@Treetop/treetop/PageFooter.svelte';

const setup = () => {
  render(PageFooter);
};

beforeEach(() => {
  setup();
});

it('renders page footer', () => {
  expect(screen.getByRole('separator')).toBeInTheDocument();
});
