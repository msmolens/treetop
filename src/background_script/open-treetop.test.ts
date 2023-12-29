import faker from 'faker';
import { expect, it, vi } from 'vitest';

import { openTreetop } from '@Treetop/background_script/open-treetop';

it('opens in current tab', () => {
  const tab: chrome.tabs.Tab = {
    active: false,
    autoDiscardable: false,
    discarded: false,
    groupId: 0,
    highlighted: false,
    incognito: false,
    index: 0,
    pinned: false,
    selected: false,
    windowId: 0,
  };

  const url = faker.internet.url();

  const update = vi.fn();
  vi.spyOn(chrome.tabs, 'update').mockImplementation(update);

  vi.spyOn(chrome.runtime, 'getURL').mockReturnValue(url);

  openTreetop(tab);

  expect(update).toHaveBeenCalledOnce();
  expect(update).toHaveBeenCalledWith({ url });
});
