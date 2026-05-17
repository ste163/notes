import {
  test,
  expect,
  createNote,
  writeContent,
  validateContent,
} from '../fixtures'
import { locators, dimensions, data } from '../constants'

test.describe('sidebar', () => {
  test('handles creating and selecting a note on small screen sizes', async ({
    page,
  }) => {
    await page.setViewportSize(dimensions.small)
    await page.goto('/')

    // when visiting the page, the sidebar is full screen. Editor is not visible
    await expect(page.locator(locators.sidebar.mainElement)).toBeVisible()
    await expect(page.locator(locators.editor.content)).not.toBeVisible()

    // creating a note closes the sidebar on small screens
    await createNote(page, 'My first note')
    await expect(page.locator(locators.sidebar.mainElement)).not.toBeAttached()
    await expect(page.locator(locators.editor.content)).toBeVisible()
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'First note content...')
    await page.locator(locators.statusBar.save).click()
    await expect(page.locator(locators.notification.save)).toBeAttached()
    await expect(page.locator(locators.notification.save)).not.toBeAttached()

    // reloading the page renders the note and its content, and no sidebar
    await page.reload()
    await expect(page.locator(locators.sidebar.mainElement)).not.toBeAttached()
    await validateContent(page, 'First note content...')

    // can create a new note and select it — open the sidebar from status bar
    await page.locator(locators.statusBar.sidebarToggle).click()
    await expect(page.locator(locators.sidebar.mainElement)).toBeVisible()
    await expect(page.locator(locators.editor.content)).not.toBeVisible()
    await createNote(page, 'My second note')
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'Second note content...')
    // allow 300ms auto-save debounce to fire before switching notes
    await page.waitForTimeout(500)

    // clicking the second note closes the sidebar only
    await page.locator(locators.statusBar.sidebarToggle).click()
    await page.locator(locators.sidebar.note).nth(0).click()
    await validateContent(page, 'Second note content...')
  })

  test('handles resizing the viewport with the sidebar open', async ({
    page,
  }) => {
    // starting on large screen sizes
    await page.setViewportSize(dimensions.large)
    await page.goto('/')

    // the sidebar is open by default — create a note
    await createNote(page, 'My first note')

    // the sidebar is still open before resizing
    await expect(page.locator(locators.sidebar.mainElement)).toBeVisible()

    // resizing to a smaller screen size
    await page.setViewportSize(dimensions.small)
    // wait for the app to respond to the viewport resize event
    await expect(page.locator('body')).toHaveClass(/body-invisible/)

    // because the sidebar is open, make it full screen and the editor is not visible
    await expect(page.locator(locators.sidebar.mainElement)).toBeVisible()
    await expect(page.locator(locators.editor.content)).not.toBeVisible()

    // resizing to a medium screen size should keep the sidebar open and show editor
    await page.setViewportSize(dimensions.medium)

    await expect(page.locator(locators.sidebar.mainElement)).toBeVisible()
    await expect(page.locator(locators.editor.content)).toBeVisible()
  })

  test('handles resizing the viewport with the sidebar closed', async ({
    page,
  }) => {
    // starting on large screen sizes
    await page.setViewportSize(dimensions.large)
    await page.goto('/')

    // the sidebar is open by default — create a note
    await createNote(page, 'My first note')

    // close the sidebar
    await page.locator(locators.statusBar.sidebarToggle).click()
    await expect(page.locator(locators.sidebar.mainElement)).not.toBeAttached()

    // when resizing to a smaller screen, sidebar should stay hidden
    await page.setViewportSize(dimensions.small)
    await expect(page.locator(locators.sidebar.mainElement)).not.toBeAttached()
    // editor is visible
    await expect(page.locator(locators.editor.content)).toBeVisible()

    // resizing to a medium screen size should keep the sidebar closed and show editor
    await page.setViewportSize(dimensions.medium)

    await expect(page.locator(locators.sidebar.mainElement)).not.toBeAttached()
    await expect(page.locator(locators.editor.content)).toBeVisible()
  })

  test('handles creating a note on larger screen sizes', async ({ page }) => {
    await page.goto('/')

    await page.locator(locators.sidebar.createNote.button).click()

    // no value, so saving is disabled
    await expect(page.locator(locators.sidebar.createNote.save)).toBeDisabled()
    await page.locator(locators.sidebar.createNote.input).fill('My first note')
    await expect(page.locator(locators.sidebar.createNote.save)).toBeEnabled()
    // removing the value disables save again
    await page.locator(locators.sidebar.createNote.input).clear()
    await expect(page.locator(locators.sidebar.createNote.save)).toBeDisabled()
    // typing a value enables save again
    await page.locator(locators.sidebar.createNote.input).fill('My first note')

    // canceling stops note create and hides input
    await page.locator(locators.sidebar.createNote.cancel).click()
    await expect(
      page.locator(locators.sidebar.createNote.input)
    ).not.toBeAttached()

    // re-opening has cleared inputted value
    await page.locator(locators.sidebar.createNote.button).click()
    await expect(page.locator(locators.sidebar.createNote.input)).toHaveValue(
      ''
    )
    await expect(page.locator(locators.sidebar.createNote.save)).toBeDisabled()

    // adding a title and hitting the create button again removes the input
    // and clicking create again has reset the input
    await page.locator(locators.sidebar.createNote.input).fill('My first note')
    await page.locator(locators.sidebar.createNote.button).click()
    await expect(
      page.locator(locators.sidebar.createNote.input)
    ).not.toBeAttached()
    await page.locator(locators.sidebar.createNote.button).click()
    await expect(page.locator(locators.sidebar.createNote.input)).toHaveValue(
      ''
    )

    // opening the create note input, adding a title, but closing the sidebar and then reopening it
    // has closed the input. Opening the input again does not render the input title
    await page.locator(locators.sidebar.createNote.input).fill('My first note')
    await page.locator(locators.statusBar.sidebarToggle).click()
    await page.locator(locators.statusBar.sidebarToggle).click()
    await expect(
      page.locator(locators.sidebar.createNote.input)
    ).not.toBeAttached()
    await page.locator(locators.sidebar.createNote.button).click()
    await expect(page.locator(locators.sidebar.createNote.input)).toHaveValue(
      ''
    )

    // creating a note does not auto-close the sidebar on wide screen
    await page.locator(locators.sidebar.createNote.input).fill('My first note')
    await page.locator(locators.sidebar.createNote.save).click()
    await expect(page.locator(locators.sidebar.mainElement)).toBeVisible()
  })

  test('handles deleting a note on different screen sizes by right click', async ({
    page,
  }) => {
    await page.setViewportSize(dimensions.large)
    await page.goto('/')

    await createNote(page, 'My first note')
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'First note content...')
    await page.waitForTimeout(500)
    await createNote(page, 'My second note')
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'Second note content...')
    await page.waitForTimeout(500)
    await createNote(page, 'My third note')
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'Third note content...')
    await page.waitForTimeout(500)

    // by this point the third note is rendered
    // right clicking on the first note opens the delete dialog with the note title rendered
    await page.locator(locators.sidebar.note).nth(2).click({ button: 'right' })
    await expect(
      page.locator(locators.dialog.deleteDialog.header)
    ).toContainText('My first note')
    // delete the note
    await page.locator(locators.dialog.deleteDialog.confirmButton).click()
    // render the getting started section as there is no data
    await validateContent(page, data.expected.editor.content.default)

    // user can't edit the get started text
    const editorFirstChild = page
      .locator(locators.editor.content)
      .locator(':scope > *')
      .first()
    await expect(editorFirstChild).toHaveAttribute('contenteditable', 'false')

    // select the third note
    await page.locator(locators.sidebar.note).nth(0).click()
    await validateContent(page, 'Third note content...')

    // right click the third note and delete it
    await page.locator(locators.sidebar.note).nth(0).click({ button: 'right' })
    await expect(
      page.locator(locators.dialog.deleteDialog.header)
    ).toContainText('My third note')
    await page.locator(locators.dialog.deleteDialog.confirmButton).click()

    // only the second note is left
    await expect(page.locator(locators.sidebar.note)).toHaveCount(1)
    await expect(page.locator(locators.sidebar.note).nth(0)).toContainText(
      'My second note'
    )

    // resize to a smaller screen size
    await page.setViewportSize(dimensions.small)
    // create the first and third notes again
    await createNote(page, 'My first note')
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'First note content...')
    // open sidebar
    await page.locator(locators.statusBar.sidebarToggle).click()
    await createNote(page, 'My third note')
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'Third note content...')

    // open sidebar
    await page.locator(locators.statusBar.sidebarToggle).click()

    // right click opens the dialog
    await page.locator(locators.sidebar.note).nth(1).click({ button: 'right' })
    await expect(
      page.locator(locators.dialog.deleteDialog.header)
    ).toContainText('My first note')
    // delete the note
    await page.locator(locators.dialog.deleteDialog.confirmButton).click()

    // the delete dialog is no longer rendered
    await expect(
      page.locator(locators.dialog.deleteDialog.header)
    ).not.toBeAttached()

    // sidebar is still opened with only the two remaining notes
    await expect(page.locator(locators.sidebar.note)).toHaveCount(2)
    await expect(page.locator(locators.sidebar.note).nth(0)).toContainText(
      'My third note'
    )
    await expect(page.locator(locators.sidebar.note).nth(1)).toContainText(
      'My second note'
    )

    // refreshing the page keeps the sidebar opened because no note is selected
    await page.reload()
    await expect(page.locator(locators.sidebar.mainElement)).toBeVisible()
    await expect(page.locator(locators.editor.content)).not.toBeVisible()
  })

  test('on small screen size, allows for deleting notes by long-press', async ({
    page,
  }) => {
    await page.setViewportSize(dimensions.small)
    await page.goto('/')

    // create a few notes
    await createNote(page, 'My first note')
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'First note content...')
    await page.locator(locators.statusBar.sidebarToggle).click()
    await createNote(page, 'My second note')
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'Second note content...')
    await page.locator(locators.statusBar.sidebarToggle).click()
    await createNote(page, 'My third note')
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await writeContent(page, 'Third note content...')
    await page.locator(locators.statusBar.sidebarToggle).click()

    // simulate a long press tap on the first note (index 2 = oldest)
    const noteTarget = page.locator(locators.sidebar.note).nth(2)
    const box = await noteTarget.boundingBox()
    if (!box) throw new Error('note target bounding box not found')
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    // Touch constructor requires `identifier`; use evaluate for proper construction
    await page.evaluate(
      ({ selector, index, cx, cy }) => {
        const el = document.querySelectorAll(selector)[index] as Element
        const touch = new Touch({
          identifier: 1,
          target: el,
          clientX: cx,
          clientY: cy,
        })
        el.dispatchEvent(
          new TouchEvent('touchstart', {
            touches: [touch],
            changedTouches: [touch],
            bubbles: true,
            cancelable: true,
          })
        )
      },
      { selector: locators.sidebar.note, index: 2, cx, cy }
    )
    await page.waitForTimeout(2500)
    await page.evaluate(
      ({ selector, index }) => {
        const el = document.querySelectorAll(selector)[index] as Element
        el.dispatchEvent(
          new TouchEvent('touchend', {
            touches: [],
            changedTouches: [],
            bubbles: true,
            cancelable: true,
          })
        )
      },
      { selector: locators.sidebar.note, index: 2 }
    )

    await expect(
      page.locator(locators.dialog.deleteDialog.header)
    ).toContainText('My first note')
    await page.locator(locators.dialog.deleteDialog.confirmButton).click()

    // only the second and third notes are left
    await expect(page.locator(locators.sidebar.note)).toHaveCount(2)
    await expect(page.locator(locators.sidebar.note).nth(0)).toContainText(
      'My third note'
    )
    await expect(page.locator(locators.sidebar.note).nth(1)).toContainText(
      'My second note'
    )

    // refreshing the page keeps the sidebar open
    await page.reload()
    await expect(page.locator(locators.sidebar.mainElement)).toBeVisible()
    await expect(page.locator(locators.sidebar.note)).toHaveCount(2)
  })

  test('tracks sidebar open/closed state across page reloads', async ({
    page,
  }) => {
    await page.goto('/')
    // default sidebar value added
    expect(new URL(page.url()).search).toBe('?sidebar=open')

    // sidebar was opened and stays open on refresh
    await expect(page.locator(locators.sidebar.createNote.button)).toBeVisible()
    await page.reload()
    expect(new URL(page.url()).search).toBe('?sidebar=open')
    await expect(page.locator(locators.sidebar.createNote.button)).toBeVisible()

    // closing sidebar from sidebar close button
    await page.locator(locators.statusBar.sidebarToggle).click()
    expect(new URL(page.url()).search).toBe('?sidebar=close')
    await expect(
      page.locator(locators.sidebar.createNote.button)
    ).not.toBeAttached()
    await page.reload()
    expect(new URL(page.url()).search).toBe('?sidebar=close')
    await expect(
      page.locator(locators.sidebar.createNote.button)
    ).not.toBeAttached()

    // handle sidebar open close from status bar
    await page.locator(locators.statusBar.sidebarToggle).click()
    expect(new URL(page.url()).search).toBe('?sidebar=open')
    await expect(page.locator(locators.sidebar.createNote.button)).toBeVisible()
    await page.reload()
    expect(new URL(page.url()).search).toBe('?sidebar=open')
    await expect(page.locator(locators.sidebar.createNote.button)).toBeVisible()

    // and we can close it
    await page.locator(locators.statusBar.sidebarToggle).click()
    expect(new URL(page.url()).search).toBe('?sidebar=close')
    await expect(
      page.locator(locators.sidebar.createNote.button)
    ).not.toBeAttached()
  })

  test('resizing the sidebar saves it to local storage', async ({ page }) => {
    // makes editor narrow enough (~568px) to trigger the ellipsis menu (<700px threshold)
    await page.setViewportSize({ width: 1000, height: 660 })
    await page.goto('/')
    const sidebar = page.locator(locators.sidebar.mainElement)
    const getWidth = (el: typeof sidebar) =>
      el.evaluate((node) => parseFloat(getComputedStyle(node).width))

    // check the sidebar width is close to the default (~230px)
    expect(await getWidth(sidebar)).toBeCloseTo(230, 0)
    // no ellipsis button as the editor is wide
    await expect(
      page.locator(locators.editor.menu.ellipsisButton)
    ).not.toBeVisible()

    // drag and move the sidebar
    const handle = page.locator(locators.sidebar.resizeHandle)
    const box = await handle.boundingBox()
    if (!box) throw new Error('sidebar resize handle not found')
    await page.mouse.move(box.x, box.y)
    await page.mouse.down()
    await page.mouse.move(400, box.y)
    await page.mouse.up()

    expect(await getWidth(sidebar)).toBeCloseTo(400, 0)

    // reload the page
    await page.reload()
    expect(await getWidth(sidebar)).toBeCloseTo(400, 0)
    // ellipsis button renders as the editor was resized
    await expect(
      page.locator(locators.editor.menu.ellipsisButton)
    ).toBeVisible()
  })
})
