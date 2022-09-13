import { mockEvent } from 'mockzilla-webextension';

import { init } from '@Treetop/background_script/init';
import { createContextMenus } from '@Treetop/background_script/menus';
import { openTreetop } from '@Treetop/background_script/open-treetop';
import { openWelcome } from '@Treetop/background_script/open-welcome';
import { setDefaultOptions } from '@Treetop/background_script/options';

jest
  .mock('@Treetop/background_script/menus')
  .mock('@Treetop/background_script/open-treetop')
  .mock('@Treetop/background_script/open-welcome')
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

it('opens Treetop when the browser action is clicked', async () => {
  const browserActionClicked = mockEvent(mockBrowser.browserAction.onClicked);
  mockBrowser.runtime.onInstalled.addListener.expect(openWelcome);

  await init();

  const tab = {
    index: 0,
    highlighted: false,
    active: false,
    pinned: false,
    incognito: false,
  };

  const info = {
    modifiers: [],
    button: 0,
  };

  browserActionClicked.emit(tab, info);

  expect(openTreetop).toHaveBeenCalledTimes(1);
});
