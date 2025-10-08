<script lang="ts">
  import type { MDCDialogCloseEvent } from '@material/dialog';
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import TextField from '@smui/textfield';
  import truncate from 'lodash-es/truncate';

  import type * as Treetop from './types';

  interface Props {
    open?: boolean;
    title: string;
    url: string | undefined;
    onSave: (changes: Treetop.PropertiesChanges) => void;
    onCancel: () => void;
  }

  let {
    open = $bindable(false),
    title,
    url,
    onSave,
    onCancel,
  }: Props = $props();

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
      onCancel();
    }
  }

  function handleTextFieldFocus(e: CustomEvent | FocusEvent) {
    e = e as FocusEvent;

    // Select all text in the focused input element
    const labelElement = e.currentTarget as HTMLLabelElement;
    const inputElement = labelElement.control as HTMLInputElement;
    inputElement.select();
  }

  const maxHeaderTitleLength = 58;

  //
  // Dialog strings
  //

  const cancelLabel = chrome.i18n.getMessage('dialogButtonCancel');
  const saveLabel = chrome.i18n.getMessage('dialogButtonSave');

  const header = $derived.by(() => {
    if (title) {
      // Truncate bookmark title
      const truncatedTitle = truncate(title, {
        length: maxHeaderTitleLength,
      });
      return chrome.i18n.getMessage(
        'dialogHeadingBookmarkProperties',
        truncatedTitle,
      );
    }

    return undefined;
  });

  //
  // Bookmark properties
  //

  let editTitle = $derived(title);
  let editUrl = $derived(url);

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

    onSave(changes);
  }
</script>

<Dialog
  bind:open
  class="treetopDialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  onSMUIDialogOpened={handleOpened}
  onSMUIDialogClosed={handleClosed}>
  <Title id="dialog-title">{header}</Title>
  <Content id="dialog-content">
    <div>
      <TextField
        bind:this={nameLabel}
        bind:value={editTitle}
        onfocus={handleTextFieldFocus}
        onkeydown={onKeyDown}
        label="Name"
        style="width: 100%;" />
    </div>
    {#if url !== undefined}
      <div>
        <TextField
          bind:value={editUrl}
          onfocus={handleTextFieldFocus}
          onkeydown={onKeyDown}
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
