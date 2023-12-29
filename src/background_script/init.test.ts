import EventEmitter from 'node:events';
import { expect, it, vi } from 'vitest';

import { init } from '@Treetop/background_script/init';
import { openTreetop } from '@Treetop/background_script/open-treetop';
import { openWelcome } from '@Treetop/background_script/open-welcome';

vi.mock('@Treetop/background_script/menus');
vi.mock('@Treetop/background_script/open-treetop');
vi.mock('@Treetop/background_script/open-welcome');
vi.mock('@Treetop/background_script/options');

it('opens the welcome page when the extension is installed', async () => {
  const emitter = new EventEmitter();

  vi.spyOn(chrome.runtime.onInstalled, 'addListener').mockImplementation(
    (listener) => {
      emitter.addListener('onInstalled', listener);
    },
  );

  const noop = vi.fn();
  vi.spyOn(chrome.action.onClicked, 'addListener').mockImplementation(noop);

  await init();

  emitter.emit('onInstalled');

  expect(openWelcome).toHaveBeenCalledOnce();
});

it('opens Treetop when the browser action is clicked', async () => {
  const emitter = new EventEmitter();

  const noop = vi.fn();
  vi.spyOn(chrome.runtime.onInstalled, 'addListener').mockImplementation(noop);

  vi.spyOn(chrome.action.onClicked, 'addListener').mockImplementation(
    (listener) => {
      emitter.addListener('onClicked', listener);
    },
  );

  await init();

  emitter.emit('onClicked');

  expect(openTreetop).toHaveBeenCalledOnce();
});
