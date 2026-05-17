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
  await page.waitForURL((url) => new URLSearchParams(url.search).get('noteId') !== prevNoteId)
  await expect(page.locator(locators.statusBar.save)).toBeEnabled()
}

export async function writeContent(page: Page, content: string): Promise<void> {
  await page.locator(locators.editor.content).locator(':scope > *').first().pressSequentially(content)
}

export async function validateContent(page: Page, expectedContent: string): Promise<void> {
  await expect(
    page.locator(locators.editor.content).locator(':scope > *').first()
  ).toHaveText(expectedContent)
}

type Fixtures = {
  clearDb: void
}

export const test = base.extend<Fixtures>({
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

export { expect }
