import { mockEvent } from 'mockzilla-webextension';

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

it('opens the welcome page when the extension is installed', async () => {
  const runtimeOnInstalled = mockEvent(mockBrowser.runtime.onInstalled);
  mockBrowser.browserAction.onClicked.addListener.expect(openTreetop);

  await init();

  runtimeOnInstalled.emit({
    reason: 'install',
    temporary: false,
  });

  expect(openWelcome).toHaveBeenCalledTimes(1);
});
