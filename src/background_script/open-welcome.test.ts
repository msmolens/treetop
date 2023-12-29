import { describe, expect, it, vi } from 'vitest';

import { openWelcome } from '@Treetop/background_script/open-welcome';

describe('welcome page', () => {
  it('opens welcome page on install', () => {
    const create = vi.fn();
    vi.spyOn(chrome.tabs, 'create').mockImplementation(create);

    const url = 'welcome.url';
    vi.spyOn(chrome.runtime, 'getURL').mockReturnValue(url);

    openWelcome({ reason: 'install' });

    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({ url });
  });

  it.each<chrome.runtime.OnInstalledReason>([
    'update',
    'chrome_update',
  ] as const)("doesn't open welcome page for update event: %s", (reason) => {
    const create = vi.fn();
    vi.spyOn(chrome.tabs, 'create').mockImplementation(create);

    openWelcome({ reason });

    expect(create).not.toHaveBeenCalled();
  });
});
