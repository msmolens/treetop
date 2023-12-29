import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, it } from 'vitest';

import PageFooter from '@Treetop/treetop/PageFooter.svelte';

const setup = () => {
  render(PageFooter);
};

beforeEach(() => {
  setup();
});

afterEach(() => {
  cleanup();
});

it('renders page footer', () => {
  expect(screen.getByRole('separator')).toBeInTheDocument();
});
