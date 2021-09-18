<script>
  import { createEventDispatcher } from 'svelte';
  import type { MDCDialogCloseEvent } from '@material/dialog';
  import Button, { Label } from '@smui/button/styled';
  import Dialog, { Actions, Content, Title } from '@smui/dialog/styled';
  import TextField from '@smui/textfield/styled';
  import truncate from 'lodash-es/truncate';
  import * as browser from 'webextension-polyfill';

  import type * as Treetop from './types';

  const dispatch = createEventDispatcher();

  export let open = false;
  export let title: string;
  export let url: string | undefined;

  let dialog: Dialog;
  let nameLabel: TextField;

  function handleOpened() {
    nameLabel.focus();
  }

  function handleClosed(e: MDCDialogCloseEvent) {
    if (e.detail.action === 'save') {
      save();
    } else {
      dispatch('cancel');
    }
  }

  function handleTextFieldFocus(e: FocusEvent) {
    const inputElement = e.currentTarget as HTMLInputElement;
    inputElement.select();
  }

  const maxHeaderTitleLength = 58;

  //
  // Dialog strings
  //

  const cancelLabel = browser.i18n.getMessage('dialogButtonCancel');
  const saveLabel = browser.i18n.getMessage('dialogButtonSave');

  let header: string;
  $: if (title) {
    // Truncate bookmark title
    const truncatedTitle = truncate(title, {
      length: maxHeaderTitleLength,
    });
    header = browser.i18n.getMessage(
      'dialogHeadingBookmarkProperties',
      truncatedTitle
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
      // TODO: Could fix URL like firefox-78-0.1/docshell/base/URIFixup.jsm#L269
      changes.url = editUrl;
    }

    dispatch('save', changes);
  }
</script>

<Dialog
  bind:this={dialog}
  bind:open
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  on:MDCDialog:opened={handleOpened}
  on:MDCDialog:closed={handleClosed}>
  <Title id="dialog-title">{header}</Title>
  <Content id="dialog-content">
    <div>
      <TextField
        bind:this={nameLabel}
        bind:value={editTitle}
        on:focus={handleTextFieldFocus}
        label="Name"
        style="width: 100%;" />
    </div>
    {#if url !== undefined}
      <div>
        <TextField
          bind:value={editUrl}
          on:focus={handleTextFieldFocus}
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
