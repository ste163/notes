import {
  test,
  expect,
  createNote,
  writeContent,
  validateContent,
} from '../fixtures'
import { locators, dimensions, data } from '../constants'

test.describe('editor', () => {
  test('editor is disabled if note not found in database', async ({ page }) => {
    await page.goto('/')

    await createNote(page, 'test note')
    await writeContent(page, 'Here is some content')

    // no errors are in the status bar
    await expect(page.locator(locators.statusBar.alert)).not.toBeAttached()

    // go to a url with a note id that doesn't exist
    await page.goto('/?noteId=thisNoteDoesNotExist')

    // renders the get started page and the editor is disabled
    await validateContent(page, data.expected.editor.content.default)
    const editorFirstChild = page
      .locator(locators.editor.content)
      .locator(':scope > *')
      .first()
    await expect(editorFirstChild).toHaveAttribute('contenteditable', 'false')
    await expect(page.locator(locators.statusBar.alert)).toBeAttached()
  })

  test('editor menu buttons move to ellipsis menu properly on sidebar resize', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1020, height: 768 })
    await page.goto('/')

    // create a note so the editor is enabled
    await createNote(page, 'test note')

    // confirm that the ellipsis is not visible and only main buttons render
    await expect(
      page.locator(locators.editor.menu.ellipsisButton)
    ).not.toBeVisible()
    await expect(
      page.locator(locators.editor.menu.mainSection).locator(':scope > *')
    ).toHaveCount(data.expected.editor.mainToolbarButtonCount.large)

    // dragging the sidebar to the right hides buttons
    const handle = page.locator(locators.sidebar.resizeHandle)
    const box = await handle.boundingBox()
    if (!box) throw new Error('sidebar resize handle not found')
    await page.mouse.move(box.x, box.y)
    await page.mouse.down()
    await page.mouse.move(1000, box.y)
    await page.mouse.up()

    // the fewest buttons render
    await expect(
      page.locator(locators.editor.menu.ellipsisButton)
    ).toBeVisible()
    await expect(
      page.locator(locators.editor.menu.mainSection).locator(':scope > *')
    ).toHaveCount(data.expected.editor.mainToolbarButtonCount.small)

    // opening the ellipsis menu shows the other buttons
    await page.locator(locators.editor.menu.ellipsisButton).click()
    await expect(
      page.locator(locators.editor.menu.ellipsisSection).locator(':scope > *')
    ).toHaveCount(data.expected.editor.ellipsisToolbarButtonCount.small)

    // and the first item is H1, so that we know items were ordered correctly
    await expect(
      page
        .locator(locators.editor.menu.ellipsisSection)
        .locator(':scope > *')
        .nth(0)
    ).toContainText('Heading 1')

    // closing the sidebar renders all the buttons without ellipsis
    await page.locator(locators.statusBar.sidebarToggle).click()
    await expect(
      page.locator(locators.editor.menu.ellipsisButton)
    ).not.toBeVisible()
    await expect(
      page.locator(locators.editor.menu.mainSection).locator(':scope > *')
    ).toHaveCount(data.expected.editor.mainToolbarButtonCount.large)
  })

  test('editor menu buttons move to the ellipsis menu properly on different viewport sizes', async ({
    page,
  }) => {
    await page.setViewportSize(dimensions.large)
    await page.goto('/')

    // create a note so that we can interact with buttons
    await createNote(page, 'test note')

    // on large size, all buttons are visible and no ellipsis button
    await expect(
      page.locator(locators.editor.menu.ellipsisButton)
    ).not.toBeVisible()
    await expect(
      page.locator(locators.editor.menu.mainSection).locator(':scope > *')
    ).toHaveCount(data.expected.editor.mainToolbarButtonCount.large)

    // on medium, some main buttons visible and ellipsis button is visible
    await page.setViewportSize(dimensions.medium)
    await expect(
      page.locator(locators.editor.menu.ellipsisButton)
    ).toBeVisible()
    await expect(
      page.locator(locators.editor.menu.mainSection).locator(':scope > *')
    ).toHaveCount(data.expected.editor.mainToolbarButtonCount.small)

    // opening the ellipsis menu shows the hidden buttons
    await page.locator(locators.editor.menu.ellipsisButton).click()
    await expect(
      page.locator(locators.editor.menu.ellipsisSection).locator(':scope > *')
    ).toHaveCount(data.expected.editor.ellipsisToolbarButtonCount.small)

    // clicking the first ellipsis menu item closes the menu
    await page
      .locator(locators.editor.menu.ellipsisSection)
      .locator(':scope > *')
      .first()
      .click()
    await expect(
      page.locator(locators.editor.menu.ellipsisSection)
    ).not.toBeVisible()

    // opening the ellipsis menu and clicking outside it closes it
    await page.locator(locators.editor.menu.ellipsisButton).click()
    await page.locator('body').click()
    await expect(
      page.locator(locators.editor.menu.ellipsisSection)
    ).not.toBeVisible()
  })

  test('when opening a dialog, the ellipsis menu retains its rendering state: visible or hidden', async ({
    page,
  }) => {
    // on large size, opening then closing a dialog does not render the ellipsis menu
    await page.setViewportSize(dimensions.large)
    await page.goto('/')

    await createNote(page, 'test note')

    // the correct main button count is shown without ellipsis
    await expect(
      page.locator(locators.editor.menu.ellipsisButton)
    ).not.toBeVisible()
    await expect(
      page.locator(locators.editor.menu.mainSection).locator(':scope > *')
    ).toHaveCount(data.expected.editor.mainToolbarButtonCount.large)

    // opening and closing a dialog keeps the same result on large size
    await page.locator(locators.statusBar.database).click()
    await page.locator(locators.dialog.close).click()
    await expect(
      page.locator(locators.editor.menu.ellipsisButton)
    ).not.toBeVisible()
    await expect(
      page.locator(locators.editor.menu.mainSection).locator(':scope > *')
    ).toHaveCount(data.expected.editor.mainToolbarButtonCount.large)

    // on medium size, opening then closing the dialog keeps the ellipsis menu and main button section items the same
    await page.setViewportSize(dimensions.medium)
    await expect(
      page.locator(locators.editor.menu.ellipsisButton)
    ).toBeVisible()
    await expect(
      page.locator(locators.editor.menu.mainSection).locator(':scope > *')
    ).toHaveCount(data.expected.editor.mainToolbarButtonCount.small)
  })

  test('handles debounced auto-saving when changes are made', async ({
    page,
  }) => {
    await page.setViewportSize(dimensions.large)
    await page.goto('/')

    await createNote(page, 'test note')
    // wait for the note to be fully loaded before writing content
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'Here is some unsaved content')

    // The debounce fires 300ms after the last keystroke with no observable DOM signal.
    // A short wait ensures the debounce and IndexedDB write complete before reloading.
    await page.waitForTimeout(500)

    // reloading the page should render the same note
    await page.reload()
    await validateContent(page, 'Here is some unsaved content')
  })
})
