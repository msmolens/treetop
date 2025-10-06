import faker from 'faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { openTreetop } from '@Treetop/background_script/open-treetop';

describe('open-treetop', () => {
  let tab: chrome.tabs.Tab;
  let url: string;

  beforeEach(() => {
    tab = {
      active: false,
      autoDiscardable: false,
      discarded: false,
      frozen: false,
      groupId: 0,
      highlighted: false,
      incognito: false,
      index: 0,
      lastAccessed: faker.datatype.datetime().getTime(),
      pinned: false,
      selected: false,
      windowId: 0,
    };

    url = faker.internet.url();
  });

  it('opens in current tab', async () => {
    const get = vi.fn().mockResolvedValue({ openInNewTab: false });
    vi.spyOn(chrome.storage.local, 'get').mockImplementation(get);

    const update = vi.fn();
    vi.spyOn(chrome.tabs, 'update').mockImplementation(update);

    vi.spyOn(chrome.runtime, 'getURL').mockReturnValue(url);

    openTreetop(tab);

    await new Promise((resolve) => setTimeout(resolve));

    expect(update).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith({ url });
  });

  it('opens in new tab', async () => {
    const get = vi.fn().mockResolvedValue({ openInNewTab: true });
    vi.spyOn(chrome.storage.local, 'get').mockImplementation(get);

    const create = vi.fn();
    vi.spyOn(chrome.tabs, 'create').mockImplementation(create);

    vi.spyOn(chrome.runtime, 'getURL').mockReturnValue(url);

    openTreetop(tab);

    await new Promise((resolve) => setTimeout(resolve));

    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({ url });
  });
});
