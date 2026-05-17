import type { Page } from '@playwright/test'

export async function clearIndexDb(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const dbs = await indexedDB.databases()
    dbs.forEach(({ name }) => name && indexedDB.deleteDatabase(name))
  })
}
