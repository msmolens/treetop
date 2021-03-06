import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import faker from 'faker';

import FilterInput from '@Treetop/treetop/FilterInput.svelte';

const setup = () => {
  return render(FilterInput);
};

beforeEach(() => {
  jest.useFakeTimers('modern');

  mockBrowser.i18n.getMessage.expect('search').andReturn('Search');
});

afterEach(() => {
  jest.useRealTimers();
});

it('renders filter input', () => {
  setup();

  expect(screen.getByLabelText(/^search$/i)).toBeInTheDocument();
});

it('dispatches input event when text is typed after debouncing', () => {
  const { component } = setup();

  const callback = jest.fn();
  component.$on('input', callback);

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.random.words();
  userEvent.type(input, words);

  expect(callback).not.toHaveBeenCalled();
  jest.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(1);

  // FIXME: Check event properties
  // https://github.com/sveltejs/svelte/issues/3119

  userEvent.type(input, '{backspace}');

  expect(callback).toHaveBeenCalledTimes(1);
  jest.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(2);

  userEvent.clear(input);

  expect(callback).toHaveBeenCalledTimes(2);
  jest.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(3);
});

it('dispatches input event when enter is pressed', () => {
  const { component } = setup();

  const callback = jest.fn();
  component.$on('input', callback);

  const input = screen.getByLabelText(/^search$/i);

  const words = faker.random.words();
  userEvent.type(input, `${words}{enter}`);

  // Check that the event fired immediately
  // FIXME: Check event properties
  // https://github.com/sveltejs/svelte/issues/3119
  expect(callback).toHaveBeenCalledTimes(1);

  // Check that the debounce was cancelled and the event didn't fire a second
  // time
  jest.runAllTimers();
  expect(callback).toHaveBeenCalledTimes(1);
});
