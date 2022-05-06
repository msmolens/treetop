import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import faker from 'faker';

import FilterInput from '@Treetop/treetop/FilterInput.svelte';

const setup = () => {
  return {
    user: userEvent.setup({ delay: null }),
    ...render(FilterInput),
  };
};

beforeEach(() => {
  jest.useFakeTimers();

  mockBrowser.i18n.getMessage.expect('search').andReturn('Search');
});

afterEach(() => {
  jest.useRealTimers();
});

it('renders filter input', () => {
  setup();

  expect(screen.getByLabelText(/^search$/i)).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('dispatches input event when text is typed after debouncing', async () => {
  const { component, user } = setup();

  const callback = jest.fn();
  component.$on('input', callback);

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.random.words();
  await user.type(input, words);

  expect(callback).not.toHaveBeenCalled();
  jest.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(1);

  // FIXME: Check event properties
  // https://github.com/sveltejs/svelte/issues/3119

  await user.type(input, '{backspace}');

  expect(callback).toHaveBeenCalledTimes(1);
  jest.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(2);

  await user.clear(input);

  expect(callback).toHaveBeenCalledTimes(2);
  jest.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(3);
});

it('dispatches input event when enter is pressed', async () => {
  const { component, user } = setup();

  const callback = jest.fn();
  component.$on('input', callback);

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.random.words();
  await user.type(input, words);
  await user.keyboard('[Enter]');

  // Check that the event fired immediately
  // FIXME: Check event properties
  // https://github.com/sveltejs/svelte/issues/3119
  expect(callback).toHaveBeenCalledTimes(1);

  // Check that the debounce was cancelled and the event didn't fire a second
  // time
  jest.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(1);
});

it('shows the clear button when text is entered', async () => {
  const { user } = setup();

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.random.words();
  await user.type(input, words);

  jest.runAllTimers();

  await waitFor(() => {
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  expect(input).toHaveValue(words);
});

it('clears the input when the clear button is pressed', async () => {
  const { component, user } = setup();

  const callback = jest.fn();
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

  await waitFor(() => {
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

it('clears the input when the escape is pressed', async () => {
  const { component, user } = setup();

  const callback = jest.fn();
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

  await waitFor(() => {
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
