import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { locators } from '../constants'
import { clearIndexDb } from '../utils/clear-indexed-db'

export async function createNote(page: Page, title: string): Promise<void> {
  const prevNoteId = new URL(page.url()).searchParams.get('noteId')
  await page.locator(locators.sidebar.createNote.button).click()
  await page.locator(locators.sidebar.createNote.input).fill(title)
  await page.locator(locators.sidebar.createNote.save).click()
  // wait for the URL to reflect the new noteId so the note is fully selected
  await page.waitForURL(
    (url) => new URLSearchParams(url.search).get('noteId') !== prevNoteId
  )
  await expect(page.locator(locators.statusBar.save)).toBeEnabled()
}

export async function focusEditorAtEnd(page: Page): Promise<void> {
  const inner = page
    .locator(locators.editor.content)
    .locator(':scope > *')
    .first()
  await inner.click()
  await expect(inner).toHaveClass(/ProseMirror-focused/)
  await page.keyboard.press('End')
}

export async function writeContent(page: Page, content: string): Promise<void> {
  await page
    .locator(locators.editor.content)
    .locator(':scope > *')
    .first()
    .pressSequentially(content)
}

export async function validateContent(
  page: Page,
  expectedContent: string
): Promise<void> {
  await expect(
    page.locator(locators.editor.content).locator(':scope > *').first()
  ).toHaveText(expectedContent)
}

interface AutoFixtures {
  // Playwright recommends this approach
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  clearDb: void
}

interface SyncFixtures {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  connectToRemoteDb: void
}

const COUCH_URL = 'http://localhost:5984'
const COUCH_AUTH = `Basic ${Buffer.from('admin:password').toString('base64')}`

export const test = base.extend<AutoFixtures>({
  clearDb: [
    async ({ page }, use) => {
      await page.goto('/')
      await clearIndexDb(page)
      await page.evaluate(() => localStorage.clear())
      await use()
    },
    { auto: true },
  ],
})

export const syncTest = test.extend<SyncFixtures>({
  connectToRemoteDb: [
    async ({ page }, use) => {
      // Ensure a clean, known CouchDB state for each test.
      // Ignore 404 if the database does not yet exist.
      await page.request.delete(`${COUCH_URL}/notes`, {
        headers: { Authorization: COUCH_AUTH },
        failOnStatusCode: false,
      })
      await page.request.put(`${COUCH_URL}/notes`, {
        headers: { Authorization: COUCH_AUTH },
      })

      // Inject credentials so initRemoteConnection() picks them up on reload.
      await page.evaluate(() => {
        localStorage.setItem(
          'remote-db-details',
          JSON.stringify({
            username: 'admin',
            password: 'password',
            host: 'localhost',
            port: '5984',
          })
        )
      })

      // Reload triggers DOMContentLoaded → DatabaseEvents.Init → initRemoteConnection().
      await page.reload()

      // Wait for PouchDB's first `paused` event (initial sync complete, even on empty DB),
      // which dispatches SyncingPaused and renders the status-bar-synced-on element.
      await page.locator(locators.statusBar.syncedOn).waitFor({
        state: 'attached',
        timeout: 15_000,
      })

      await use()
    },
    { auto: true },
  ],
})

export { expect }
