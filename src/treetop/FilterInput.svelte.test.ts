import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import faker from 'faker';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import FilterInput from '@Treetop/treetop/FilterInput.svelte';

const setup = () => {
  return {
    user: userEvent.setup({ delay: null }),
    ...render(FilterInput),
  };
};

beforeEach(() => {
  vi.useFakeTimers();

  vi.spyOn(chrome.i18n, 'getMessage').mockReturnValue('Search');
});

afterEach(() => {
  cleanup();

  vi.useRealTimers();
});

it('renders filter input', () => {
  setup();

  expect(screen.getByLabelText(/^search$/i)).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('focus input when focus() method is called', () => {
  const { component } = setup();

  expect(screen.getByLabelText(/^search$/i)).not.toHaveFocus();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  component.focus();

  expect(screen.getByLabelText(/^search$/i)).toHaveFocus();
});

it('dispatches input event when text is typed after debouncing', async () => {
  const { component, user } = setup();

  let lastFilter = '';

  const callback = vi.fn().mockImplementation((e) => {
    const filterInputEvent = e as CustomEvent<{ filter: string }>;
    lastFilter = filterInputEvent.detail.filter;
  });
  component.$on('input', callback);

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.random.words();
  await user.type(input, words);

  expect(callback).not.toHaveBeenCalled();
  vi.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(1);
  expect(lastFilter).toBe(words);

  await user.type(input, '{backspace}');

  expect(callback).toHaveBeenCalledTimes(1);
  vi.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(2);
  expect(lastFilter).toBe(words.slice(0, words.length - 1));

  await user.clear(input);

  expect(callback).toHaveBeenCalledTimes(2);
  vi.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(3);
  expect(lastFilter).toBe('');
});

it('dispatches input event when enter is pressed', async () => {
  const { component, user } = setup();

  let lastFilter = '';

  const callback = vi.fn().mockImplementation((e) => {
    const filterInputEvent = e as CustomEvent<{ filter: string }>;
    lastFilter = filterInputEvent.detail.filter;
  });
  component.$on('input', callback);

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.random.words();
  await user.type(input, words);
  await user.keyboard('[Enter]');

  // Check that the event fired immediately
  expect(callback).toHaveBeenCalledTimes(1);
  expect(lastFilter).toBe(words);

  // Check that the debounce was cancelled and the event didn't fire a second
  // time
  vi.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(1);
});

it('shows the clear button when text is entered', async () => {
  const { user } = setup();

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.random.words();
  await user.type(input, words);

  vi.runAllTimers();

  await waitFor(() => {
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  expect(input).toHaveValue(words);
});

it('clears the input when the clear button is pressed', async () => {
  const { component, user } = setup();

  let lastFilter = '';

  const callback = vi.fn().mockImplementation((e) => {
    const filterInputEvent = e as CustomEvent<{ filter: string }>;
    lastFilter = filterInputEvent.detail.filter;
  });
  component.$on('input', callback);

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.random.words();
  await user.type(input, words);
  await user.keyboard('[Enter]');

  await waitFor(() => {
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  expect(callback).toHaveBeenCalledTimes(1);

  screen.getByRole('button').click();

  await waitFor(() => {
    expect(callback).toHaveBeenCalledTimes(2);
  });
  expect(lastFilter).toBe('');

  await waitFor(() => {
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

it('clears the input when the escape is pressed', async () => {
  const { component, user } = setup();

  let lastFilter = '';

  const callback = vi.fn().mockImplementation((e) => {
    const filterInputEvent = e as CustomEvent<{ filter: string }>;
    lastFilter = filterInputEvent.detail.filter;
  });
  component.$on('input', callback);

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.random.words();
  await user.type(input, words);
  await user.keyboard('[Enter]');

  await waitFor(() => {
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  expect(callback).toHaveBeenCalledTimes(1);

  await user.keyboard('{Escape}');

  await waitFor(() => {
    expect(callback).toHaveBeenCalledTimes(2);
  });
  expect(lastFilter).toBe('');

  await waitFor(() => {
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
