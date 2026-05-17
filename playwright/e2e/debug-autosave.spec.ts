import { test } from '../fixtures'
import { createNote, writeContent } from '../fixtures'
import { locators, dimensions } from '../constants'

test('debug autosave', async ({ page }) => {
  await page.setViewportSize(dimensions.large)
  await page.goto('/')

  await createNote(page, 'test note')
  console.log('URL after createNote:', page.url())

  await writeContent(page, 'Here is some unsaved content')

  await page.waitForTimeout(1000)

  const content = await page.locator(locators.editor.content).locator(':scope > *').first().textContent()
  console.log('Content before reload:', content)
  console.log('URL before reload:', page.url())

  await page.reload()
  await page.waitForTimeout(500)
  const afterContent = await page.locator(locators.editor.content).locator(':scope > *').first().textContent()
  console.log('Content after reload:', afterContent)
  console.log('URL after reload:', page.url())
})
