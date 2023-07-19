import { openWelcome } from '@Treetop/background_script/open-welcome';

describe('welcome page', () => {
  it('opens welcome page on install', () => {
    const url = 'welcome.url';
    mockBrowser.runtime.getURL.expect.andReturn(url);
    mockBrowser.tabs.create.expect({ url });

    openWelcome({
      reason: 'install',
      temporary: false,
    });
  });

  it("doesn't open welcome page on temporary installs", () => {
    openWelcome({
      reason: 'install',
      temporary: true,
    });
  });

  it.each(['update', 'browser_update'] as const)(
    "doesn't open welcome page for update event: %s",
    (reason) => {
      openWelcome({
        reason,
        temporary: false,
      });
    },
  );
});
