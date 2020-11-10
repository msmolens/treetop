import { init } from '@Treetop/background_script/init';
import { createContextMenus } from '@Treetop/background_script/menus';
import { openTreetop, openWelcome } from '@Treetop/background_script/open';
import { setDefaultOptions } from '@Treetop/background_script/options';

jest
  .mock('@Treetop/background_script/menus')
  .mock('@Treetop/background_script/open')
  .mock('@Treetop/background_script/options');

it('initializes extension', async () => {
  mockBrowser.runtime.onInstalled.addListener.expect(openWelcome);
  mockBrowser.browserAction.onClicked.addListener.expect(openTreetop);

  await init();

  expect(setDefaultOptions).toHaveBeenCalledTimes(1);
  expect(createContextMenus).toHaveBeenCalledTimes(1);
});
