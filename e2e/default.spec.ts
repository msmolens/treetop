import { test, expect } from './fixtures';

test.beforeEach(async ({ page, extensionId }, _testInfo) => {
  await page.goto(`chrome-extension://${extensionId}/treetop.html`);
});

test('page header', async ({ page }) => {
  const banner = page.getByRole('banner');
  await expect(banner.locator('.treetop')).toHaveText('Treetop');
  await expect(banner.getByRole('textbox')).toBeVisible();
  await expect(banner.getByRole('textbox')).toHaveText('');
  await expect(banner.getByRole('button')).toHaveText(/settings/i);
});

test('default bookmarks', async ({ page }) => {
  // Root folder
  const rootFolder = page.locator('.folder').first();
  await expect(rootFolder.locator('.heading').first()).toHaveText('Bookmarks');

  // Bookmarks bar
  const bookmarksBar = rootFolder.locator('.folder > .heading').nth(0);
  const bookmarksBarContents = rootFolder.locator('.folder > .contents').nth(0);

  await expect(bookmarksBar).toHaveText('Bookmarks bar');
  await expect(bookmarksBarContents).toHaveText('Empty folder');

  // Other bookmarks
  const otherBookmarks = rootFolder.locator('.folder > .heading').nth(1);
  const otherBookmarksContents = rootFolder
    .locator('.folder > .contents')
    .nth(1);

  await expect(otherBookmarks).toHaveText('Other bookmarks');
  await expect(otherBookmarksContents).toHaveText('Empty folder');
});
