import { locators, DEFAULT_WAIT, data } from '../constants'
import { clearIndexDb } from '../utils'

/**
 * Tests the main application flow
 * without errors being mocked, so it should run successfully.
 * In-depth testing of interactions happen in other test files.
 *
 * However, this is not testing the connection to a CouchDB instance.
 * That requires more infrastructure setup as it needs to
 * create the docker container to run CouchDB.
 *
 * Current tests use IndexedDB.
 */
describe('flow', () => {
  beforeEach(async () => {
    await clearIndexDb()
    // by default, cypress always clears localStorage between test runs
  })

  it('can create, edit, write, select, and delete notes', () => {
    cy.visit('/')

    // render the getting started section as there is no data
    cy.validateContent(data.expected.editor.content.default)

    // user can't edit the get started text
    cy.get(locators.editor.content)
      .children()
      .first()
      .invoke('attr', 'contenteditable')
      .should('eq', 'false')

    // status bar state is expected (ie, disabled)
    cy.get(locators.statusBar.save).should('be.disabled')
    cy.get(locators.statusBar.delete).should('be.disabled')
    cy.get(locators.statusBar.savedOn).should('not.exist')

    // no alerts render on fresh load
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.statusBar.alert).should('not.exist')

    // can create note
    cy.createNote('My first note')

    // status bar is now enabled
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.statusBar.save).should('be.enabled')
    cy.get(locators.statusBar.delete).should('be.enabled')
    cy.get(locators.statusBar.savedOn).should('be.visible')

    // can edit the title
    cy.get(locators.editTitle.button).click()
    cy.get(locators.editTitle.input).should('have.value', 'My first note')
    cy.get(locators.editTitle.input).type(' - updated{enter}')
    cy.wait(DEFAULT_WAIT)

    cy.get(locators.notification.save).should('exist')
    cy.get(locators.notification.save).should('not.exist') // wait for it to disappear

    // can attempt to update title but can hit escape to cancel
    cy.get(locators.editTitle.button).click()
    cy.get(locators.editTitle.input).should(
      'have.value',
      'My first note - updated'
    )
    cy.get(locators.editTitle.input).type(' - Do not save this!')
    cy.get(locators.editTitle.input).type('{esc}')
    cy.wait(DEFAULT_WAIT)
    // the note update was cancelled
    cy.get(locators.notification.save).should('not.exist')
    cy.get(locators.editTitle.button).click()
    cy.get(locators.editTitle.input).should(
      'have.value',
      'My first note - updated'
    )

    // created note renders in sidebar
    cy.get(locators.sidebar.note).should('have.length', 1)
    cy.get(locators.sidebar.note).should(
      'contain.text',
      'My first note - updated'
    )
    // selecting the note again renders the same note
    cy.get(locators.sidebar.note).click()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.sidebar.note).should(
      'contain.text',
      'My first note - updated'
    )

    // can write and save content
    cy.writeContent('Lets add some content!')
    // and can add content after opening and closing a dialog
    // (to ensure the editor is still enabled)
    cy.get(locators.statusBar.delete).click()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.dialog.close).click()
    cy.writeContent(' Extra.')
    cy.validateContent('Lets add some content! Extra.')

    cy.get(locators.statusBar.save).click()
    cy.get(locators.notification.save).should('exist')
    cy.get(locators.notification.save).should('not.exist') // wait for it to disappear

    // can create another note
    cy.createNote('My second note')

    cy.get(locators.notification.save).should('not.exist') // wait for it to disappear

    // should have opened the second note, check the title and content
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.editTitle.button).click()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.editTitle.input).should('have.value', 'My second note')
    cy.get(locators.editor.content).click()
    // because the value wasn't changed, don't save
    cy.get(locators.notification.save).should('not.exist')

    // editor content empty
    cy.validateContent('')
    // add content
    cy.writeContent('Second note content')

    // sidebar renders the two notes
    cy.get(locators.sidebar.note).should('have.length', 2)
    cy.get(locators.sidebar.note).eq(0).should('contain.text', 'My second note')
    cy.get(locators.sidebar.note)
      .eq(1)
      .should('contain.text', 'My first note - updated')
    cy.get(locators.sidebar.note).eq(1).should('be.enabled')

    // select first note and renders it
    cy.get(locators.sidebar.note).eq(1).click()
    cy.wait(DEFAULT_WAIT)

    cy.get(locators.editTitle.button).click()
    cy.get(locators.editTitle.input).should(
      'have.value',
      'My first note - updated'
    )
    cy.get(locators.editTitle.input).type('{enter}')

    // validate the first content was loaded
    cy.validateContent('Lets add some content! Extra.')

    // select the second note renders its content
    // because of the isDirty check to auto-save unsaved notes
    cy.get(locators.sidebar.note).eq(0).click()
    cy.get(locators.editTitle.button).click()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.editTitle.input).should('have.value', 'My second note')
    cy.get(locators.editTitle.input).type('{enter}')
    cy.validateContent('Second note content')

    // can delete a note
    cy.get(locators.statusBar.delete).click()
    cy.get('h2').should('contain', 'Delete')

    // can close modal and the editor is enabled again
    cy.get(locators.dialog.close).click()
    cy.writeContent('More content! ')

    // and then the note can really be deleted
    cy.get(locators.statusBar.delete).click()
    cy.get(locators.dialog.deleteDialog.confirmButton).click()

    // renders the get started screen
    cy.validateContent(data.expected.editor.content.default)
    // user can't edit the get started text
    cy.get(locators.editor.content)
      .children()
      .first()
      .invoke('attr', 'contenteditable')
      .should('eq', 'false')

    // the status bar save and delete are disabled
    cy.get(locators.statusBar.save).should('be.disabled')
    cy.get(locators.statusBar.delete).should('be.disabled')
    cy.get(locators.statusBar.savedOn).should('not.exist')
    // only one note renders in sidebar
    cy.get(locators.sidebar.note).should('have.length', 1)
    cy.get(locators.sidebar.note).should(
      'contain.text',
      'My first note - updated'
    )
    // can select the first note and the status bar is enabled again
    cy.get(locators.sidebar.note).click()
    cy.get(locators.statusBar.save).should('be.enabled')
    cy.get(locators.statusBar.delete).should('be.enabled')
    cy.get(locators.statusBar.savedOn).should('be.visible')
    // and the editor is still active
    cy.writeContent('More content! ')
    cy.validateContent('More content! Lets add some content! Extra.')
    cy.wait(DEFAULT_WAIT)

    // can delete first note and the app is reset to the get started screen
    cy.get(locators.statusBar.delete).click()
    cy.get(locators.dialog.deleteDialog.confirmButton).click()

    // renders the get started screen
    cy.validateContent(data.expected.editor.content.default)
    // user can't edit the get started text
    cy.get(locators.editor.content)
      .children()
      .first()
      .invoke('attr', 'contenteditable')
      .should('eq', 'false')
    // and everything is disabled
    cy.get(locators.statusBar.save).should('be.disabled')
    cy.get(locators.statusBar.delete).should('be.disabled')
    cy.get(locators.statusBar.savedOn).should('not.exist')
    cy.get(locators.sidebar.note).should('have.length', 0)

    // no alerts have occurred
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.statusBar.alert).should('not.exist')
    // TODO
    //
    // FUTURE INFRASTRUCTURE DB SYNCING
    // ... (all db syncing interactions)
  })
})
