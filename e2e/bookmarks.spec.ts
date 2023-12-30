import { test, expect } from './fixtures';

test.beforeEach(async ({ page, extensionId }, _testInfo) => {
  await page.goto(`chrome-extension://${extensionId}/treetop.html`);

  await page.evaluate(async () => {
    await chrome.bookmarks.create({
      parentId: '1',
      url: 'https://github.com',
      title: 'GitHub',
    });
    await chrome.bookmarks.create({
      parentId: '2',
      url: 'https://gitlab.com',
      title: 'GitLab',
    });
  });
});

test('existing bookmarks', async ({ page }) => {
  const rootFolder = page.locator('.folder').first();
  const bookmarksBarContents = rootFolder.locator('.folder > .contents').nth(0);
  await expect(bookmarksBarContents).toHaveCount(1);
  expect(
    bookmarksBarContents.getByRole('link', { name: 'GitHub' }),
  ).toBeVisible();

  const otherBookmarksContents = rootFolder
    .locator('.folder > .contents')
    .nth(1);
  await expect(otherBookmarksContents).toHaveCount(1);
  expect(
    otherBookmarksContents.getByRole('link', { name: 'GitLab' }),
  ).toBeVisible();
});
