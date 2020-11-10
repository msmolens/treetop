import { setDefaultOptions } from '@Treetop/background_script/options';

it('sets default options', async () => {
  mockBrowser.storage.local.set.expect;

  await setDefaultOptions();
});
