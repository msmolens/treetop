import faker from 'faker';
import type { Action, Tabs } from 'webextension-polyfill';

import { openTreetop } from '@Treetop/background_script/open';

let tab: Tabs.Tab;
let info: Action.OnClickData;
let url: string;

beforeEach(() => {
  tab = {
    index: 0,
    highlighted: false,
    active: false,
    pinned: false,
    incognito: false,
  };

  info = {
    modifiers: [],
    button: 0,
  };

  url = faker.internet.url();

  mockBrowser.runtime.getURL.expect('treetop.html').andReturn(url);
});

describe('left click', () => {
  beforeEach(() => {
    info.button = 0;
  });

  it('opens in current tab', () => {
    mockBrowser.tabs.update.expect({ url });

    openTreetop(tab, info);
  });

  it('opens in new tab with Ctrl', () => {
    info.modifiers.push('Ctrl');

    mockBrowser.tabs.create.expect({
      active: false,
      url,
    });

    openTreetop(tab, info);
  });

  it('opens in new active tab with Ctrl+Shift', () => {
    info.modifiers.push('Ctrl', 'Shift');

    mockBrowser.tabs.create.expect({
      active: true,
      url,
    });

    openTreetop(tab, info);
  });

  it('opens in new window with Shift', () => {
    info.modifiers.push('Shift');

    mockBrowser.windows.create.expect({
      url,
    });

    openTreetop(tab, info);
  });
});

describe('middle click', () => {
  beforeEach(() => {
    info.button = 1;
  });

  it('opens in new tab', () => {
    mockBrowser.tabs.create.expect({
      active: false,
      url,
    });

    openTreetop(tab, info);
  });

  it('opens in new active tab with Shift', () => {
    info.modifiers.push('Shift');

    mockBrowser.tabs.create.expect({
      active: true,
      url,
    });

    openTreetop(tab, info);
  });
});
