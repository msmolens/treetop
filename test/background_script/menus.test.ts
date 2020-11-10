import { createContextMenus } from '@Treetop/background_script/menus';

const NUM_ACTIONS = 3;
const NUM_SEPARATORS = 2;

it('creates context menus', () => {
  mockBrowser.runtime.getURL.expect('');
  mockBrowser.i18n.getMessage.expect.times(NUM_ACTIONS);
  mockBrowser.menus.create.expect.times(NUM_ACTIONS + NUM_SEPARATORS);

  createContextMenus();
});
