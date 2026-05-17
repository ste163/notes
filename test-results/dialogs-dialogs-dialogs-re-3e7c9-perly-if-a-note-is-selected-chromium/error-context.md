# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dialogs.spec.ts >> dialogs >> dialogs render properly if a note is selected
- Location: playwright/e2e/dialogs.spec.ts:51:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h2')
Expected substring: "Delete"
Received string:    ""

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h2')

```

# Test source

```ts
  1  | import { test, expect, createNote } from '../fixtures'
  2  | import { locators } from '../constants'
  3  | 
  4  | test.describe('dialogs', () => {
  5  |   test('dialogs render properly if no note selected', async ({ page }) => {
  6  |     await page.goto('/')
  7  | 
  8  |     // database dialog renders properly on reload
  9  |     await page.locator(locators.statusBar.database).click()
  10 |     await expect(page.locator('h2')).toContainText('Database')
  11 |     await page.reload()
  12 |     await expect(page.locator('h2')).toContainText('Database')
  13 | 
  14 |     // closing the dialog and reloading does not render it
  15 |     await page.locator(locators.dialog.close).click()
  16 |     await expect(page.locator('h2')).not.toBeAttached()
  17 |     await page.reload()
  18 |     await expect(page.locator('h2')).not.toBeAttached()
  19 | 
  20 |     // about dialog renders properly on reload
  21 |     await page.locator(locators.statusBar.about).click()
  22 |     await expect(page.locator('h2')).toContainText('About')
  23 |     await page.reload()
  24 |     await expect(page.locator('h2')).toContainText('About')
  25 | 
  26 |     // can toggle the agpl license visibility
  27 |     await page.locator(locators.dialog.about.agplButton).click()
  28 |     await expect(page.locator(locators.dialog.about.agplContent)).toBeVisible()
  29 |     // and can close it
  30 |     await page.locator(locators.dialog.about.agplButton).click()
  31 |     await expect(page.locator(locators.dialog.about.agplContent)).not.toBeAttached()
  32 | 
  33 |     // can toggle the apache license visibility
  34 |     await page.locator(locators.dialog.about.apacheButton).click()
  35 |     await page.locator(locators.dialog.about.apacheContent).scrollIntoViewIfNeeded()
  36 |     await expect(page.locator(locators.dialog.about.apacheContent)).toBeVisible()
  37 |     // and can close it
  38 |     await page.locator(locators.dialog.about.apacheButton).click()
  39 |     await expect(page.locator(locators.dialog.about.apacheContent)).not.toBeAttached()
  40 | 
  41 |     await page.locator(locators.dialog.close).click()
  42 | 
  43 |     // delete note dialog should not render as no note was selected
  44 |     await expect(page.locator(locators.statusBar.delete)).toBeDisabled()
  45 | 
  46 |     // and visiting the url directly should not render the dialog
  47 |     await page.goto('/?dialog=delete')
  48 |     await expect(page.locator('h2')).not.toBeAttached()
  49 |   })
  50 | 
  51 |   test('dialogs render properly if a note is selected', async ({ page }) => {
  52 |     await page.goto('/')
  53 | 
  54 |     await createNote(page, 'Dialog test note')
  55 | 
  56 |     await page.locator(locators.statusBar.database).click()
  57 | 
  58 |     // database dialog can be reloaded
  59 |     await expect(page.locator('h2')).toContainText('Database')
  60 |     await page.reload()
  61 |     await expect(page.locator('h2')).toContainText('Database')
  62 | 
  63 |     // closing the dialog and reloading does not render it
  64 |     await page.locator(locators.dialog.close).click()
  65 |     await expect(page.locator('h2')).not.toBeAttached()
  66 |     await page.reload()
  67 |     await expect(page.locator('h2')).not.toBeAttached()
  68 | 
  69 |     // delete note dialog opens properly
  70 |     await page.locator(locators.statusBar.delete).click()
> 71 |     await expect(page.locator('h2')).toContainText('Delete')
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  72 |     await page.reload()
  73 |     await expect(page.locator('h2')).toContainText('Delete')
  74 | 
  75 |     // closing the dialog and reloading does not render it
  76 |     await page.locator(locators.dialog.close).click()
  77 |     await expect(page.locator('h2')).not.toBeAttached()
  78 |     await page.reload()
  79 |     await expect(page.locator('h2')).not.toBeAttached()
  80 |   })
  81 | })
  82 | 
```