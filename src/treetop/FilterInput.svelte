<script>
  /* eslint-disable simple-import-sort/imports */

  import { createEventDispatcher, onMount } from 'svelte';
  import TextField from '@smui/textfield/styled';
  // FIXME: IconButton must appear after TextField, otherwise custom
  // TextField styles aren't applied correctly
  import IconButton from '@smui/icon-button/styled';
  import debounce from 'lodash-es/debounce';
  import { browser } from 'webextension-polyfill-ts';

  // Filter string
  let filter = '';

  // Icon button
  let iconButton: IconButton;

  // Debounce duration for typing in filter input (ms)
  const FILTER_DEBOUNCE_MS = 275;

  const dispatch = createEventDispatcher<{ input: { filter: string } }>();

  // CSS 'visibility' value for the clear button.
  // The button is visible only when text is entered.
  $: clearIconButtonVisibility = filter.length > 0 ? 'visible' : 'hidden';

  onMount(() => {
    // Override button's type to disconnect it from the form. Otherwise,
    // pressing enter in the text field to submit the form causes a button
    // click, which clears the form.
    iconButton.getElement().type = 'button';
  });

  /**
   * Dispatch an input event with the current filter string.
   */
  function dispatchInputEvent() {
    dispatch('input', { filter });
  }

  /**
   * Filter input event handler.
   */
  function handleFilterInput(event: Event) {
    event.preventDefault();

    dispatchInputEvent();
  }

  /**
   * Filter submit event handler.
   */
  function handleFilterSubmit(event: Event) {
    event.preventDefault();

    // Cancel the debounced filter input handler because we update the filter
    // immediately
    debounceFilterInput.cancel();

    dispatchInputEvent();
  }

  /**
   * Clear the filter input element.
   */
  function clearFilterInput() {
    filter = '';

    dispatchInputEvent();
  }

  /**
   * Debounced filter input handler.
   */
  const debounceFilterInput = debounce((event: Event) => {
    handleFilterInput(event);
  }, FILTER_DEBOUNCE_MS);
</script>

<style>
  .searchBox {
    padding: 0 1em;
  }
</style>

<div class="searchBox">
  <form on:submit={handleFilterSubmit}>
    <TextField
      bind:value={filter}
      on:input={debounceFilterInput}
      label={browser.i18n.getMessage('search')}>
      <IconButton
        bind:this={iconButton}
        class="material-icons"
        slot="trailingIcon"
        style="visibility: {clearIconButtonVisibility}"
        on:click={clearFilterInput}>clear</IconButton>
    </TextField>
  </form>
</div>
