/* eslint-disable @typescript-eslint/ban-ts-comment */

import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { OnClickedCallback } from '@Treetop/treetop/menus/MenuItem';
import { MenuItem } from '@Treetop/treetop/menus/MenuItem';
import { MenuManager } from '@Treetop/treetop/menus/MenuManager';

let menuManager: MenuManager;

class TestMenuItem extends MenuItem {
  constructor(
    onClickedCallback: OnClickedCallback,
    private isEnabled: boolean,
  ) {
    super(onClickedCallback);
  }

  enabled(nodeId: string): boolean {
    void nodeId;
    return this.isEnabled;
  }
}

const createOnClickData = (
  menuItemId: string,
): chrome.contextMenus.OnClickData => {
  return {
    menuItemId,
    editable: false,
    pageUrl: '',
  };
};

const createTab = (): chrome.tabs.Tab => {
  return {
    id: faker.number.int(),
    index: faker.number.int(),
    highlighted: false,
    active: false,
    pinned: false,
    incognito: false,
    windowId: 0,
    selected: false,
    discarded: false,
    autoDiscardable: false,
    groupId: 0,
    lastAccessed: faker.date.past().getTime(),
    frozen: false,
  };
};

const createElement = (withNodeId = true) => {
  return {
    dataset: {
      ...(withNodeId && { nodeId: faker.string.alphanumeric(8) }),
    },
  };
};

beforeEach(() => {
  menuManager = new MenuManager();
});

describe('updateEnabled', () => {
  beforeEach(() => {
    const callback: OnClickedCallback = (nodeId) => {
      void nodeId;
    };

    menuManager.registerMenuItem('test1', new TestMenuItem(callback, true));
    menuManager.registerMenuItem('test2', new TestMenuItem(callback, false));
  });

  it('updates whether menu items are enabled', async () => {
    const contextMenusUpdate = vi.fn();
    vi.spyOn(chrome.contextMenus, 'update').mockImplementation(
      contextMenusUpdate,
    );

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.updateEnabled();

    expect(contextMenusUpdate).toHaveBeenCalledTimes(2);
    expect(contextMenusUpdate).toHaveBeenCalledWith('test1', { enabled: true });
    expect(contextMenusUpdate).toHaveBeenCalledWith('test2', {
      enabled: false,
    });
  });

  it("no-op if active element isn't provided", async () => {
    menuManager.activeElement = null;

    await menuManager.updateEnabled();
  });

  it("no-op if nodeId isn't available", async () => {
    // @ts-ignore
    menuManager.activeElement = createElement(false);

    await menuManager.updateEnabled();
  });
});

describe('handleMenuClicked', () => {
  let info: chrome.contextMenus.OnClickData;
  let tab: chrome.tabs.Tab;
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

    const getCurrent = vi.fn().mockResolvedValue(tab);
    vi.spyOn(chrome.tabs, 'getCurrent').mockImplementation(getCurrent);

    // @ts-ignore
    menuManager.activeElement = element;

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(true);
    expect(test2Clicked).toBe(false);
    expect(clickedNodeId).toBe(element.dataset.nodeId);
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
    const getCurrent = vi.fn().mockResolvedValue(otherTab);
    vi.spyOn(chrome.tabs, 'getCurrent').mockImplementation(getCurrent);

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(false);
    expect(test2Clicked).toBe(false);
  });

  it("no-op if active element isn't provided", async () => {
    menuManager.activeElement = null;

    const getCurrent = vi.fn().mockResolvedValue(tab);
    vi.spyOn(chrome.tabs, 'getCurrent').mockImplementation(getCurrent);

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(false);
    expect(test2Clicked).toBe(false);
  });

  it("no-op if nodeId isn't available", async () => {
    // @ts-ignore
    menuManager.activeElement = createElement(false);

    const getCurrent = vi.fn().mockResolvedValue(tab);
    vi.spyOn(chrome.tabs, 'getCurrent').mockImplementation(getCurrent);

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(false);
    expect(test2Clicked).toBe(false);
  });

  it("no-op if menuItemId isn't registered", async () => {
    info.menuItemId = 'other';

    const getCurrent = vi.fn().mockResolvedValue(tab);
    vi.spyOn(chrome.tabs, 'getCurrent').mockImplementation(getCurrent);

    // @ts-ignore
    menuManager.activeElement = createElement();

    await menuManager.handleMenuClicked(info, tab);

    expect(test1Clicked).toBe(false);
    expect(test2Clicked).toBe(false);
  });
});
