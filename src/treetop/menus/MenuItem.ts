export interface OnClickedCallback {
  (nodeId: string): void;
}

export abstract class MenuItem {
  constructor(private readonly onClickedCallback: OnClickedCallback) {}

  abstract enabled(nodeId: string): boolean;

  onClicked(nodeId: string): void {
    this.onClickedCallback(nodeId);
  }
}
