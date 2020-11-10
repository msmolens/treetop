<script lang="ts">
  import type { MDCDialogCloseEvent } from '@material/dialog';

  import Button, { Label } from '@smui/button';
  import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let shown: boolean = false;
  export let title: string;
  export let message: string;
  export let cancelLabel: string;
  export let confirmLabel: string;

  let dialog: Dialog;
  $: if (dialog) {
    if (shown) {
      dialog.open();
    } else {
      dialog.close();
    }
  }

  function handleClosed(e: MDCDialogCloseEvent) {
    const message = e.detail.action === 'confirm' ? 'confirm' : 'cancel';
    dispatch(message);
  }
</script>

<Dialog
  bind:this={dialog}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  on:MDCDialog:closed={handleClosed}>
  <Title id="dialog-title">{title}</Title>
  <Content id="dialog-content">{message}</Content>
  <Actions>
    <Button action="cancel">
      <Label>{cancelLabel}</Label>
    </Button>
    <Button action="confirm" use={[InitialFocus]}>
      <Label>{confirmLabel}</Label>
    </Button>
  </Actions>
</Dialog>
