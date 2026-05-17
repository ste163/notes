import { test, syncTest, expect, createNote } from '../fixtures'
import type { Page } from '@playwright/test'
import { locators } from '../constants'

/**
 * End-to-end tests for the PouchDB ↔ CouchDB sync system.
 *
 * These tests require Docker services to be running (app + couchdb).
 * Locally: `pnpm test:e2e:docker`
 * CI: managed by docker-compose.e2e.yml in run-e2e.yml
 *
 * The `connectToRemoteDb` fixture (opt-in, non-auto):
 *   1. Deletes and recreates the CouchDB `notes` database for a clean state.
 *   2. Injects admin credentials into localStorage.
 *   3. Reloads the page so `initRemoteConnection()` runs with those credentials.
 *   4. Waits for PouchDB's initial `paused` event (sync established).
 */

const COUCH_URL = 'http://localhost:5984'
const COUCH_AUTH = `Basic ${Buffer.from('admin:password').toString('base64')}`

/**
 * Polls the CouchDB `notes` database until the given note title appears.
 * Uses the CouchDB REST API directly — independent of the app's UI rendering cycle.
 */
async function pollForNote(
  page: Page,
  title: string,
  timeout = 15_000
): Promise<void> {
  await expect
    .poll(
      async () => {
        const res = await page.request.get(
          `${COUCH_URL}/notes/_all_docs?include_docs=true`,
          { headers: { Authorization: COUCH_AUTH } }
        )
        const body = (await res.json()) as {
          rows: { doc?: { title?: string } }[]
        }
        return body.rows.map((r) => r.doc?.title)
      },
      { timeout }
    )
    .toContain(title)
}

test.describe('sync', () => {
  syncTest('connects to CouchDB and shows Online status', async ({ page }) => {
    // connectToRemoteDb fixture already waited for initial sync;
    // assert the resulting UI state.
    await expect(page.locator(locators.statusBar.database)).toContainText(
      'Online'
    )
    await expect(page.locator(locators.statusBar.syncedOn)).toBeVisible()
  })

  syncTest(
    'outbound sync: note created in app is pushed to CouchDB',
    async ({ page }) => {
      await createNote(page, 'My Synced Note')

      await pollForNote(page, 'My Synced Note')
    }
  )

  test('inbound sync: note already in CouchDB is pulled into the app on connect', async ({
    page,
  }) => {
    // The auto clearDb fixture has already run. We set up CouchDB manually here
    // so we can insert a document BEFORE connecting (the app fetches all notes
    // on DatabaseEvents.Connected, making this the primary inbound sync path).
    const auth = {
      Authorization: COUCH_AUTH,
      'Content-Type': 'application/json',
    }

    await page.request.delete(`${COUCH_URL}/notes`, {
      headers: { Authorization: COUCH_AUTH },
      failOnStatusCode: false,
    })
    await page.request.put(`${COUCH_URL}/notes`, {
      headers: { Authorization: COUCH_AUTH },
    })
    await page.request.put(`${COUCH_URL}/notes/id-inbound-sync-test`, {
      headers: auth,
      data: JSON.stringify({
        title: 'Synced from CouchDB',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _attachments: {
          'content.html': { content_type: 'text/html', data: '' },
        },
      }),
    })

    // Connect — DatabaseEvents.Connected fires NoteEvents.GetAll which fetches
    // all documents now in local IndexedDB (pulled from CouchDB on sync).
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
    await page.reload()

    // Wait for PouchDB to complete the initial pull from CouchDB (paused event).
    // The app only calls NoteEvents.GetAll on DatabaseEvents.Connected, which fires
    // before the sync finishes — so we must reload a second time after sync is done
    // to ensure GetAll sees the docs that PouchDB pulled into local IndexedDB.
    await page.locator(locators.statusBar.syncedOn).waitFor({
      state: 'attached',
      timeout: 15_000,
    })
    await page.reload()

    await expect(page.locator(locators.sidebar.note)).toContainText(
      'Synced from CouchDB',
      { timeout: 15_000 }
    )
  })

  test('shows error state when credentials are invalid', async ({ page }) => {
    // clearDb auto fixture has cleared localStorage; set wrong credentials.
    await page.evaluate(() => {
      localStorage.setItem(
        'remote-db-details',
        JSON.stringify({
          username: 'admin',
          password: 'wrong-password',
          host: 'localhost',
          port: '5984',
        })
      )
    })
    await page.reload()

    // CouchDB returns 401 immediately, so ConnectingError fires quickly.
    await expect(page.locator(locators.statusBar.alert)).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.locator(locators.statusBar.database)).toContainText(
      'Offline'
    )
  })

  syncTest(
    'reconnects after disconnecting via the database dialog',
    async ({ page }) => {
      await expect(page.locator(locators.statusBar.database)).toContainText(
        'Online'
      )

      // Open the database dialog and click Clear to disconnect.
      await page.locator(locators.statusBar.database).click()
      await page.locator('#database-dialog-clear-button').click()
      await expect(page.locator(locators.statusBar.database)).toContainText(
        'Offline'
      )

      // Clear wipes the form inputs; re-enter credentials and reconnect.
      await page.locator('#username').fill('admin')
      await page.locator('#password').fill('password')
      await page.locator('#host').fill('localhost')
      await page.locator('#port').fill('5984')
      await page.locator('#database-dialog-submit-button').click()

      await expect(page.locator(locators.statusBar.database)).toContainText(
        'Online',
        { timeout: 15_000 }
      )
      await expect(page.locator(locators.statusBar.syncedOn)).toBeVisible({
        timeout: 15_000,
      })
    }
  )

  syncTest(
    'restarts sync when Reconnect is clicked in the database dialog',
    async ({ page }) => {
      // Open the dialog — button reads "Reconnect" because we are already connected.
      // Clicking it dispatches DatabaseEvents.Setup → database.restartConnection(),
      // which calls disconnectSyncing() then testAndInitializeConnection().
      await page.locator(locators.statusBar.database).click()
      await page.locator('#database-dialog-submit-button').click()

      // Should cycle through Connecting... and land back on Online.
      await expect(page.locator(locators.statusBar.database)).toContainText(
        'Online',
        { timeout: 15_000 }
      )
      await expect(page.locator(locators.statusBar.syncedOn)).toBeVisible({
        timeout: 15_000,
      })
    }
  )

  syncTest('sync resumes after a network interruption', async ({ page }) => {
    // Confirm sync is working before the interruption.
    await createNote(page, 'Before interruption')
    await pollForNote(page, 'Before interruption')

    // Block all requests to CouchDB — PouchDB will start accumulating failures
    // and retry with exponential back-off (retry: true in setupSyncing).
    await page.route(/localhost:5984/, (route) => route.abort())

    // Create a note while CouchDB is unreachable. PouchDB stores it locally
    // and will push it once connectivity is restored.
    await createNote(page, 'During interruption')

    // Restore connectivity. PouchDB's retry mechanism will reconnect and flush
    // the locally-queued note to CouchDB.
    await page.unroute(/localhost:5984/)

    await pollForNote(
      page,
      'During interruption',
      // Allow extra time for PouchDB's back-off retry cycle.
      20_000
    )
  })

  syncTest(
    'disconnecting stops sync and notes remain local-only',
    async ({ page }) => {
      // Disconnect via the dialog clear button.
      await page.locator(locators.statusBar.database).click()
      await page.locator('#database-dialog-clear-button').click()
      await expect(page.locator(locators.statusBar.database)).toContainText(
        'Offline'
      )
      await page.locator(locators.dialog.close).click()

      // Create a note while disconnected.
      await createNote(page, 'Local-only note')
      await expect(page.locator(locators.sidebar.note)).toContainText(
        'Local-only note'
      )

      // The note must NOT have been pushed to CouchDB.
      const res = await page.request.get(
        `${COUCH_URL}/notes/_all_docs?include_docs=true`,
        { headers: { Authorization: COUCH_AUTH } }
      )
      const body = await res.json()
      const titles = (body.rows as { doc?: { title?: string } }[]).map(
        (r) => r.doc?.title
      )
      expect(titles).not.toContain('Local-only note')
    }
  )
})
