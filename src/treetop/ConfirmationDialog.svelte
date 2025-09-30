<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MDCDialogCloseEvent } from '@material/dialog';
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, InitialFocus, Title } from '@smui/dialog';

  const dispatch = createEventDispatcher<{
    confirm: null;
    cancel: null;
  }>();

  export let open = false;
  export let title: string;
  export let message: string;
  export let cancelLabel: string;
  export let confirmLabel: string;

  function handleClosed(e: MDCDialogCloseEvent) {
    const message = e.detail.action === 'confirm' ? 'confirm' : 'cancel';
    dispatch(message);
  }
</script>

<Dialog
  bind:open
  class="treetopDialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  on:SMUIDialog:closed={handleClosed}>
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
