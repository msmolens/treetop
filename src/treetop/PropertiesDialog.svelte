<script lang="ts">
  import type * as Treetop from './types';
  import { browser } from 'webextension-polyfill-ts';
  import type { MDCDialogCloseEvent } from '@material/dialog';

  import Button, { Label } from '@smui/button';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import TextField from '@smui/textfield';

  import { createEventDispatcher } from 'svelte';
  import truncate from 'lodash/truncate';

  const dispatch = createEventDispatcher();

  export let shown: boolean = false;
  export let title: string;
  export let url: string | undefined;

  let dialog: Dialog;
  let nameLabel: TextField;
  $: if (dialog) {
    if (shown) {
      dialog.open();
      nameLabel.focus();
      // TODO: Select all text in name label
    } else {
      dialog.close();
    }
  }

  function handleClosed(e: MDCDialogCloseEvent) {
    if (e.detail.action === 'save') {
      save();
    } else {
      dispatch('cancel');
    }
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

  $: editTitle = title;
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
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  on:MDCDialog:closed={handleClosed}>
  <Title id="dialog-title">{header}</Title>
  <Content id="dialog-content">
    <div>
      <TextField
        bind:this={nameLabel}
        bind:value={editTitle}
        label="Name"
        style="width: 100%;" />
    </div>
    {#if url !== undefined}
      <div>
        <TextField bind:value={editUrl} label="Location" style="width: 100%;" />
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
