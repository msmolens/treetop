import type { ComponentProps } from 'svelte';
import { faker } from '@faker-js/faker';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import FilterInput from '@Treetop/treetop/FilterInput.svelte';

type Props = ComponentProps<typeof FilterInput>;

const setup = (
  props: Props = {
    onInput: vi.fn(),
  },
) => {
  return {
    user: userEvent.setup({
      advanceTimers: (delay) => {
        vi.advanceTimersByTime(delay);
      },
    }),
    ...render(FilterInput, props),
  };
};

beforeEach(() => {
  vi.useFakeTimers();

  vi.spyOn(chrome.i18n, 'getMessage').mockReturnValue('Search');
});

afterEach(() => {
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
  const onInput = vi.fn();

  const { user } = setup({ onInput });

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.word.words();
  await user.type(input, words);

  expect(onInput).not.toHaveBeenCalled();
  vi.runAllTimers();
  expect(onInput).toHaveBeenCalledTimes(1);
  expect(onInput).toHaveBeenLastCalledWith(words);

  await user.type(input, '{backspace}');

  expect(onInput).toHaveBeenCalledTimes(1);
  vi.runAllTimers();
  expect(onInput).toHaveBeenCalledTimes(2);
  expect(onInput).toHaveBeenLastCalledWith(words.slice(0, words.length - 1));

  await user.clear(input);

  expect(onInput).toHaveBeenCalledTimes(2);
  vi.runAllTimers();
  expect(onInput).toHaveBeenCalledTimes(3);
  expect(onInput).toHaveBeenLastCalledWith('');
});

it('dispatches input event when enter is pressed', async () => {
  const onInput = vi.fn();

  const { user } = setup({ onInput });

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.word.words();
  await user.type(input, words);
  await user.keyboard('[Enter]');

  // Check that the event fired immediately
  expect(onInput).toHaveBeenCalledTimes(1);
  expect(onInput).toHaveBeenLastCalledWith(words);

  // Check that the debounce was cancelled and the event didn't fire a second
  // time
  vi.runAllTimers();
  expect(onInput).toHaveBeenCalledTimes(1);
});

it('shows the clear button when text is entered', async () => {
  const { user } = setup();

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.word.words();
  await user.type(input, words);

  vi.runAllTimers();

  await waitFor(() => {
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  expect(input).toHaveValue(words);
});

it('clears the input when the clear button is pressed', async () => {
  const onInput = vi.fn();

  const { user } = setup({ onInput });

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.word.words();
  await user.type(input, words);
  await user.keyboard('[Enter]');

  await waitFor(() => {
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  expect(onInput).toHaveBeenCalledTimes(1);

  screen.getByRole('button').click();

  await waitFor(() => {
    expect(onInput).toHaveBeenCalledTimes(2);
  });
  expect(onInput).toHaveBeenLastCalledWith('');

  await waitFor(() => {
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

it('clears the input when the escape is pressed', async () => {
  const onInput = vi.fn();

  const { user } = setup({ onInput });

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.word.words();
  await user.type(input, words);
  await user.keyboard('[Enter]');

  await waitFor(() => {
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  expect(onInput).toHaveBeenCalledTimes(1);

  await user.keyboard('{Escape}');

  await waitFor(() => {
    expect(onInput).toHaveBeenCalledTimes(2);
  });
  expect(onInput).toHaveBeenLastCalledWith('');

  await waitFor(() => {
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
