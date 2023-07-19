import { render, screen } from '@testing-library/svelte';

import Welcome from '@Treetop/welcome/Welcome.svelte';

const setup = () => {
  render(Welcome);
};

beforeEach(() => {
  setup();
});

it('renders welcome page', () => {
  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByText(/welcome to treetop/i)).toBeInTheDocument();
  expect(screen.getByText(/getting started/i)).toBeInTheDocument();
  expect(
    screen.getByText(/open treetop by clicking its icon/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/treetop shows all your bookmarks on a single page/i),
  ).toBeInTheDocument();
});
