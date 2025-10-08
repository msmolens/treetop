<script lang="ts">
  import type { MDCDialogCloseEvent } from '@material/dialog';
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, InitialFocus, Title } from '@smui/dialog';

  interface Props {
    open?: boolean;
    title: string;
    message: string;
    cancelLabel: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    open = $bindable(false),
    title,
    message,
    cancelLabel,
    confirmLabel,
    onConfirm,
    onCancel,
  }: Props = $props();

  function handleClosed(e: MDCDialogCloseEvent) {
    switch (e.detail.action) {
      case 'confirm':
        onConfirm();
        break;
      case 'cancel':
        onCancel();
        break;
      default:
        break;
    }
  }
</script>

<Dialog
  bind:open
  class="treetopDialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  onSMUIDialogClosed={handleClosed}>
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
