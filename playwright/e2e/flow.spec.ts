import { test, expect, createNote, writeContent, validateContent } from '../fixtures'
import { locators, data } from '../constants'

/**
 * Tests the main application flow without errors being mocked.
 * Uses IndexedDB (not CouchDB).
 */
test.describe('flow', () => {
  test('can create, edit, write, select, and delete notes', async ({ page }) => {
    await page.goto('/')

    // render the getting started section as there is no data
    await validateContent(page, data.expected.editor.content.default)

    // user can't edit the get started text
    const editorFirstChild = page.locator(locators.editor.content).locator(':scope > *').first()
    await expect(editorFirstChild).toHaveAttribute('contenteditable', 'false')

    // status bar state is expected (ie, disabled)
    await expect(page.locator(locators.statusBar.save)).toBeDisabled()
    await expect(page.locator(locators.statusBar.delete)).toBeDisabled()
    await expect(page.locator(locators.statusBar.savedOn)).not.toBeAttached()

    // no alerts render on fresh load
    await expect(page.locator(locators.statusBar.alert)).not.toBeAttached()

    // can create note
    await createNote(page, 'My first note')

    // status bar is now enabled
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await expect(page.locator(locators.statusBar.delete)).toBeEnabled()
    await expect(page.locator(locators.statusBar.savedOn)).toBeVisible()

    // can edit the title
    await page.locator(locators.editTitle.button).click()
    await expect(page.locator(locators.editTitle.input)).toHaveValue('My first note')
    await page.locator(locators.editTitle.input).pressSequentially(' - updated')
    await page.locator(locators.editTitle.input).press('Enter')

    await expect(page.locator(locators.notification.save)).toBeAttached()
    await expect(page.locator(locators.notification.save)).not.toBeAttached()

    // can attempt to update title but can hit escape to cancel
    await page.locator(locators.editTitle.button).click()
    await expect(page.locator(locators.editTitle.input)).toHaveValue('My first note - updated')
    await page.locator(locators.editTitle.input).pressSequentially(' - Do not save this!')
    await page.locator(locators.editTitle.input).press('Escape')
    // the note update was cancelled
    await expect(page.locator(locators.notification.save)).not.toBeAttached()
    await page.locator(locators.editTitle.button).click()
    await expect(page.locator(locators.editTitle.input)).toHaveValue('My first note - updated')

    // created note renders in sidebar
    await expect(page.locator(locators.sidebar.note)).toHaveCount(1)
    await expect(page.locator(locators.sidebar.note)).toContainText('My first note - updated')

    // selecting the note again renders the same note
    await page.locator(locators.sidebar.note).click()
    await expect(page.locator(locators.sidebar.note)).toContainText('My first note - updated')

    // can write and save content
    await writeContent(page, 'Lets add some content!')

    // can add content after opening and closing a dialog (editor stays enabled)
    await page.locator(locators.statusBar.delete).click()
    await page.locator(locators.dialog.close).click()
    await writeContent(page, ' Extra.')
    await validateContent(page, 'Lets add some content! Extra.')

    await page.locator(locators.statusBar.save).click()
    await expect(page.locator(locators.notification.save)).toBeAttached()
    await expect(page.locator(locators.notification.save)).not.toBeAttached()

    // can create another note
    await createNote(page, 'My second note')
    await expect(page.locator(locators.notification.save)).not.toBeAttached()

    // should have opened the second note — check the title and content
    await page.locator(locators.editTitle.button).click()
    await expect(page.locator(locators.editTitle.input)).toHaveValue('My second note')
    await page.locator(locators.editor.content).click()
    // because the value wasn't changed, don't save
    await expect(page.locator(locators.notification.save)).not.toBeAttached()

    // editor content empty
    await validateContent(page, '')
    // add content
    await writeContent(page, 'Second note content')

    // sidebar renders the two notes
    await expect(page.locator(locators.sidebar.note)).toHaveCount(2)
    await expect(page.locator(locators.sidebar.note).nth(0)).toContainText('My second note')
    await expect(page.locator(locators.sidebar.note).nth(1)).toContainText('My first note - updated')
    await expect(page.locator(locators.sidebar.note).nth(1)).toBeEnabled()

    // select first note and renders it
    await page.locator(locators.sidebar.note).nth(1).click()

    await page.locator(locators.editTitle.button).click()
    await expect(page.locator(locators.editTitle.input)).toHaveValue('My first note - updated')
    await page.locator(locators.editTitle.input).press('Enter')

    // validate the first content was loaded
    await validateContent(page, 'Lets add some content! Extra.')

    // auto saving works
    await page.locator(locators.sidebar.note).nth(0).click()
    await page.locator(locators.editTitle.button).click()
    await expect(page.locator(locators.editTitle.input)).toHaveValue('My second note')
    await page.locator(locators.editTitle.input).press('Enter')
    await validateContent(page, 'Second note content')

    // can delete a note
    await page.locator(locators.statusBar.delete).click()
    await expect(page.locator('h2')).toContainText('Delete')

    // can close modal and the editor is enabled again
    await page.locator(locators.dialog.close).click()
    await writeContent(page, 'More content! ')

    // and then the note can really be deleted
    await page.locator(locators.statusBar.delete).click()
    await page.locator(locators.dialog.deleteDialog.confirmButton).click()

    // renders the get started screen
    await validateContent(page, data.expected.editor.content.default)
    // user can't edit the get started text
    await expect(editorFirstChild).toHaveAttribute('contenteditable', 'false')

    // the status bar save and delete are disabled
    await expect(page.locator(locators.statusBar.save)).toBeDisabled()
    await expect(page.locator(locators.statusBar.delete)).toBeDisabled()
    await expect(page.locator(locators.statusBar.savedOn)).not.toBeAttached()
    // only one note renders in sidebar
    await expect(page.locator(locators.sidebar.note)).toHaveCount(1)
    await expect(page.locator(locators.sidebar.note)).toContainText('My first note - updated')

    // can select the first note and the status bar is enabled again
    await page.locator(locators.sidebar.note).click()
    await expect(page.locator(locators.statusBar.save)).toBeEnabled()
    await expect(page.locator(locators.statusBar.delete)).toBeEnabled()
    await expect(page.locator(locators.statusBar.savedOn)).toBeVisible()

    // and the editor is still active, and the cursor position was saved
    await writeContent(page, ' More content!')
    await validateContent(page, 'Lets add some content! Extra. More content!')

    // can delete first note and the app is reset to the get started screen
    await page.locator(locators.statusBar.delete).click()
    await page.locator(locators.dialog.deleteDialog.confirmButton).click()

    // renders the get started screen
    await validateContent(page, data.expected.editor.content.default)
    // user can't edit the get started text
    await expect(editorFirstChild).toHaveAttribute('contenteditable', 'false')
    // and everything is disabled
    await expect(page.locator(locators.statusBar.save)).toBeDisabled()
    await expect(page.locator(locators.statusBar.delete)).toBeDisabled()
    await expect(page.locator(locators.statusBar.savedOn)).not.toBeAttached()
    await expect(page.locator(locators.sidebar.note)).toHaveCount(0)

    // no alerts have occurred
    await expect(page.locator(locators.statusBar.alert)).not.toBeAttached()
  })
})
