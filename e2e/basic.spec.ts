import { expect, test } from './fixtures'

test('popup page', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/dist/popup/index.html`)
  await expect(page.locator('button')).toHaveText('Open Options')
})
