import type { Page } from '@playwright/test'
import { locators } from '../constants'

/**
 * Waits for PouchDB's `paused` event to fire, which maps to `DatabaseEvents.SyncingPaused`
 * and causes the `status-bar-synced-on` element to render.
 *
 * Use this to confirm that an initial sync cycle has completed.
 * To assert that specific data was synced, prefer polling the CouchDB REST API directly
 * via `page.request` and `expect.poll`.
 */
export async function waitForSync(page: Page): Promise<void> {
  await page.locator(locators.statusBar.syncedOn).waitFor({
    state: 'attached',
    timeout: 10_000,
  })
}
