/* eslint-disable @typescript-eslint/ban-ts-comment */

import faker from 'faker';
import type { Menus, Tabs } from 'webextension-polyfill';

import type { OnClickedCallback } from '@Treetop/treetop/menus/MenuItem';
import { MenuItem } from '@Treetop/treetop/menus/MenuItem';
import { MenuManager } from '@Treetop/treetop/menus/MenuManager';

let menuManager: MenuManager;

class TestMenuItem extends MenuItem {
  constructor(
    onClickedCallback: OnClickedCallback,
    private isEnabled: boolean
  ) {
    super(onClickedCallback);
  }

  enabled(nodeId: string): boolean {
    void nodeId;
    return this.isEnabled;
  }
}

const createOnShownInfo = (origin: string): Menus.OnShownInfoType => {
  return {
    menuIds: [faker.datatype.number()],
    contexts: ['link'],
    viewType: 'tab',
    editable: true,
    pageUrl: `${origin}/${faker.random.word()}`,
    targetElementId: faker.datatype.number(),
  };
};

const createOnClickData = (menuItemId: string): Menus.OnClickData => {
  return {
    menuItemId,
    viewType: 'tab',
    editable: true,
    bookmarkId: '',
    modifiers: [],
    targetElementId: faker.datatype.number(),
  };
};

const createTab = (): Tabs.Tab => {
  return {
    id: faker.datatype.number(),
    index: faker.datatype.number(),
    highlighted: false,
    active: false,
    pinned: false,
    incognito: false,
  };
};

const createElement = (withNodeId = true) => {
  return {
    dataset: {
      ...(withNodeId && { nodeId: faker.random.alphaNumeric(8) }),
    },
  };
};

beforeEach(() => {
  menuManager = new MenuManager();
});

describe('handleMenuShown', () => {
  let origin: string;
  let info: Menus.OnShownInfoType;
  let tab: Tabs.Tab;

  beforeEach(() => {
    const callback: OnClickedCallback = (nodeId) => {
      void nodeId;
    };

    menuManager.registerMenuItem('test1', new TestMenuItem(callback, true));
    menuManager.registerMenuItem('test2', new TestMenuItem(callback, false));

    origin = faker.internet.url();
    info = createOnShownInfo(origin);
    tab = createTab();
  });

  it('updates whether menu items are enabled', async () => {
    mockBrowser.runtime.getURL.expect('').andReturn(origin);
    mockBrowser.tabs.getCurrent.expect.andResolve(tab);
    mockBrowser.contextMenus.update.expect('test1', { enabled: true });
    mockBrowser.contextMenus.update.expect('test2', { enabled: false });
    mockBrowser.contextMenus.refresh.expect;

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuShown(info, tab);
  });

  it("no-op if context is not 'link'", async () => {
    info.contexts = ['page'];

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuShown(info, tab);
  });

  it("no-op if viewType is not 'tab'", async () => {
    info.viewType = 'popup';

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuShown(info, tab);
  });

  it("no-op if pageUrl isn't provided", async () => {
    delete info.pageUrl;

    mockBrowser.runtime.getURL.expect('').andReturn(origin);

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuShown(info, tab);
  });

  it("no-op if pageUrl doesn't match", async () => {
    info.pageUrl = faker.internet.url();

    mockBrowser.runtime.getURL.expect('').andReturn(origin);

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuShown(info, tab);
  });

  it('no-op if not in current tab', async () => {
    mockBrowser.runtime.getURL.expect('').andReturn(origin);

    const otherTab = createTab();
    mockBrowser.tabs.getCurrent.expect.andResolve(otherTab);

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuShown(info, tab);
  });

  it("no-op if active element isn't provided", async () => {
    menuManager.activeElement = null;

    mockBrowser.runtime.getURL.expect('').andReturn(origin);
    mockBrowser.tabs.getCurrent.expect.andResolve(tab);

    await menuManager.handleMenuShown(info, tab);
  });

  it("no-op if nodeId isn't available", async () => {
    // @ts-ignore
    menuManager.activeElement = createElement(false);

    mockBrowser.runtime.getURL.expect('').andReturn(origin);
    mockBrowser.tabs.getCurrent.expect.andResolve(tab);

    await menuManager.handleMenuShown(info, tab);
  });
});

describe('handleMenuShown', () => {
  it('succeeds', () => {
    menuManager.handleMenuHidden();
  });
});

describe('handleMenuClicked', () => {
  let info: Menus.OnClickData;
  let tab: Tabs.Tab;
  let test1Clicked: boolean;
  let test2Clicked: boolean;
  let clickedNodeId: string | null;

  beforeEach(() => {
    test1Clicked = false;
    test2Clicked = false;
    clickedNodeId = null;

    const callback1: OnClickedCallback = (nodeId) => {
      test1Clicked = true;
      clickedNodeId = nodeId;
    };

    const callback2: OnClickedCallback = (nodeId) => {
      test2Clicked = true;
      clickedNodeId = nodeId;
    };

    menuManager.registerMenuItem('test1', new TestMenuItem(callback1, true));
    menuManager.registerMenuItem('test2', new TestMenuItem(callback2, false));

    info = createOnClickData('test1');
    tab = createTab();
  });

  it('calls a registered menu item handler', async () => {
    const element = createElement();
    mockBrowser.tabs.getCurrent.expect.andResolve(tab);

    // @ts-ignore
    menuManager.activeElement = element;

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(true);
    expect(test2Clicked).toBe(false);
    expect(clickedNodeId).toBe(element.dataset.nodeId);
  });

  it("no-op if viewType is not 'tab'", async () => {
    info.viewType = 'popup';

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(false);
    expect(test2Clicked).toBe(false);
  });

  it('no-op if tab is not provided', async () => {
    await menuManager.handleMenuClicked(info);

    // @ts-ignore
    menuManager.activeElement = createElement();

    expect(test1Clicked).toBe(false);
    expect(test2Clicked).toBe(false);
  });

  it('no-op if not in current tab', async () => {
    const otherTab = createTab();
    mockBrowser.tabs.getCurrent.expect.andResolve(otherTab);

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(false);
    expect(test2Clicked).toBe(false);
  });

  it("no-op if active element isn't provided", async () => {
    menuManager.activeElement = null;

    mockBrowser.tabs.getCurrent.expect.andResolve(tab);

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(false);
    expect(test2Clicked).toBe(false);
  });

  it("no-op if nodeId isn't available", async () => {
    // @ts-ignore
    menuManager.activeElement = createElement(false);

    mockBrowser.tabs.getCurrent.expect.andResolve(tab);

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(false);
    expect(test2Clicked).toBe(false);
  });

  it("no-op if menuItemId isn't registered", async () => {
    info.menuItemId = 'other';

    mockBrowser.tabs.getCurrent.expect.andResolve(tab);

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(false);
    expect(test2Clicked).toBe(false);
  });
});
