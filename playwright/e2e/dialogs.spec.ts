import { test, expect, createNote } from '../fixtures'
import { locators } from '../constants'

test.describe('dialogs', () => {
  test('dialogs render properly if no note selected', async ({ page }) => {
    await page.goto('/')

    // database dialog renders properly on reload
    await page.locator(locators.statusBar.database).click()
    await expect(page.locator('h2')).toContainText('Database')
    await page.reload()
    await expect(page.locator('h2')).toContainText('Database')

    // closing the dialog and reloading does not render it
    await page.locator(locators.dialog.close).click()
    await expect(page.locator('h2')).not.toBeAttached()
    await page.reload()
    await expect(page.locator('h2')).not.toBeAttached()

    // about dialog renders properly on reload
    await page.locator(locators.statusBar.about).click()
    await expect(page.locator('h2')).toContainText('About')
    await page.reload()
    await expect(page.locator('h2')).toContainText('About')

    // can toggle the agpl license visibility
    await page.locator(locators.dialog.about.agplButton).click()
    await expect(page.locator(locators.dialog.about.agplContent)).toBeVisible()
    // and can close it
    await page.locator(locators.dialog.about.agplButton).click()
    await expect(page.locator(locators.dialog.about.agplContent)).not.toBeAttached()

    // can toggle the apache license visibility
    await page.locator(locators.dialog.about.apacheButton).click()
    await page.locator(locators.dialog.about.apacheContent).scrollIntoViewIfNeeded()
    await expect(page.locator(locators.dialog.about.apacheContent)).toBeVisible()
    // and can close it
    await page.locator(locators.dialog.about.apacheButton).click()
    await expect(page.locator(locators.dialog.about.apacheContent)).not.toBeAttached()

    await page.locator(locators.dialog.close).click()

    // delete note dialog should not render as no note was selected
    await expect(page.locator(locators.statusBar.delete)).toBeDisabled()

    // and visiting the url directly should not render the dialog
    await page.goto('/?dialog=delete')
    await expect(page.locator('h2')).not.toBeAttached()
  })

  test('dialogs render properly if a note is selected', async ({ page }) => {
    await page.goto('/')

    await createNote(page, 'Dialog test note')

    await page.locator(locators.statusBar.database).click()

    // database dialog can be reloaded
    await expect(page.locator('h2')).toContainText('Database')
    await page.reload()
    await expect(page.locator('h2')).toContainText('Database')

    // closing the dialog and reloading does not render it
    await page.locator(locators.dialog.close).click()
    await expect(page.locator('h2')).not.toBeAttached()
    await page.reload()
    await expect(page.locator('h2')).not.toBeAttached()

    // delete note dialog opens properly
    await page.locator(locators.statusBar.delete).click()
    await expect(page.locator('h2')).toContainText('Delete')
    await page.reload()
    await expect(page.locator('h2')).toContainText('Delete')

    // closing the dialog and reloading does not render it
    await page.locator(locators.dialog.close).click()
    await expect(page.locator('h2')).not.toBeAttached()
    await page.reload()
    await expect(page.locator('h2')).not.toBeAttached()
  })
})
