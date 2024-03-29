<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MDCDialogCloseEvent } from '@material/dialog';
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import TextField from '@smui/textfield';
  import truncate from 'lodash-es/truncate';

  import type * as Treetop from './types';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let title: string;
  export let url: string | undefined;

  let nameLabel: TextField;

  /**
   * Save the changes when the user presses Enter.
   */
  function onKeyDown(e: CustomEvent | KeyboardEvent) {
    e = e as KeyboardEvent;
    if (e.key === 'Enter') {
      save();
    }
  }

  function handleOpened() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    nameLabel.focus();
  }

  function handleClosed(e: MDCDialogCloseEvent) {
    if (e.detail.action === 'save') {
      save();
    } else {
      dispatch('cancel');
    }
  }

  function handleTextFieldFocus(e: CustomEvent | FocusEvent) {
    e = e as FocusEvent;

    // Select all text in the focused input element
    const labelElement = e.currentTarget as HTMLLabelElement;
    const inputElement = labelElement.control as HTMLInputElement;
    inputElement?.select();
  }

  const maxHeaderTitleLength = 58;

  //
  // Dialog strings
  //

  const cancelLabel = chrome.i18n.getMessage('dialogButtonCancel');
  const saveLabel = chrome.i18n.getMessage('dialogButtonSave');

  let header: string;
  $: if (title) {
    // Truncate bookmark title
    const truncatedTitle = truncate(title, {
      length: maxHeaderTitleLength,
    });
    header = chrome.i18n.getMessage(
      'dialogHeadingBookmarkProperties',
      truncatedTitle,
    );
  }

  //
  // Bookmark properties
  //

  let editTitle: string;
  $: editTitle = title;

  let editUrl: string | undefined;
  $: editUrl = url;

  // Dispatch event to save changes
  function save() {
    const changes: Treetop.PropertiesChanges = {
      title: editTitle,
    };

    if (editUrl !== undefined && editUrl.length > 0) {
      // TODO: Could fix URL like in
      // https://searchfox.org/mozilla-central/rev/7b36c8b83337c4b4cdfd4ccc2168f3491a86811b/browser/components/places/content/editBookmark.js#754-755
      changes.url = editUrl;
    }

    dispatch('save', changes);
  }
</script>

<Dialog
  bind:open
  class="treetopDialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  on:SMUIDialog:opened={handleOpened}
  on:SMUIDialog:closed={handleClosed}>
  <Title id="dialog-title">{header}</Title>
  <Content id="dialog-content">
    <div>
      <TextField
        bind:this={nameLabel}
        bind:value={editTitle}
        on:focus={handleTextFieldFocus}
        on:keydown={onKeyDown}
        label="Name"
        style="width: 100%;" />
    </div>
    {#if url !== undefined}
      <div>
        <TextField
          bind:value={editUrl}
          on:focus={handleTextFieldFocus}
          on:keydown={onKeyDown}
          label="Location"
          style="width: 100%;" />
      </div>
    {/if}
  </Content>
  <Actions>
    <Button action="cancel">
      <Label>{cancelLabel}</Label>
    </Button>
    <Button
      action="save"
      disabled={editUrl !== undefined && editUrl.length === 0}>
      <Label>{saveLabel}</Label>
    </Button>
  </Actions>
</Dialog>
