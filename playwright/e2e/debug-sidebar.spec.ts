import { test, expect, createNote, writeContent } from '../fixtures'
import { locators, dimensions } from '../constants'

test('debug second note content on small screen', async ({ page }) => {
  await page.setViewportSize(dimensions.small)
  await page.goto('/')

  await createNote(page, 'My first note')
  await expect(page.locator(locators.sidebar.mainElement)).not.toBeAttached()
  await expect(page.locator(locators.editor.content)).toBeVisible()
  await expect(page.locator(locators.statusBar.save)).toBeEnabled()
  await writeContent(page, 'First note content...')
  await page.locator(locators.statusBar.save).click()
  await expect(page.locator(locators.notification.save)).toBeAttached()
  await expect(page.locator(locators.notification.save)).not.toBeAttached()

  await page.reload()
  await expect(page.locator(locators.sidebar.mainElement)).not.toBeAttached()

  await page.locator(locators.statusBar.sidebarToggle).click()
  await createNote(page, 'My second note')

  await expect(page.locator(locators.statusBar.save)).toBeEnabled()
  await writeContent(page, 'Second note content...')

  const contentAfterTyping = await page.locator(locators.editor.content).locator(':scope > *').first().textContent()
  console.log('Content after typing:', JSON.stringify(contentAfterTyping))

  await page.waitForTimeout(500)

  const contentAfterWait = await page.locator(locators.editor.content).locator(':scope > *').first().textContent()
  console.log('Content after wait:', JSON.stringify(contentAfterWait))

  await page.locator(locators.statusBar.sidebarToggle).click()
  await expect(page.locator(locators.sidebar.mainElement)).toBeVisible()

  const contentWhileSidebarOpen = await page.locator(locators.editor.content).locator(':scope > *').first().textContent()
  console.log('Content while sidebar open:', JSON.stringify(contentWhileSidebarOpen))

  await page.locator(locators.sidebar.note).nth(0).click()
  await page.waitForTimeout(100)

  const contentAfterClick = await page.locator(locators.editor.content).locator(':scope > *').first().textContent()
  console.log('Content after note click:', JSON.stringify(contentAfterClick))
})
