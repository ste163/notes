import { locators, DEFAULT_WAIT } from '../constants'
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
    cy.get('h1').should('contain', 'Get started')
    // TODO: trying to edit content is not possible (figure out how to test)

    // status bar state is expected (ie, disabled)
    cy.get(locators.statusBar.save).should('be.disabled')
    cy.get(locators.statusBar.delete).should('be.disabled')
    cy.get(locators.statusBar.savedOn).should('not.exist')

    // TODO: fix this bug, sort on fields createdAt when using default index throws error during getAll
    // the app should load without any errors
    // need to wait for all async events to finish
    // cy.wait(DEFAULT_WAIT)
    // cy.get('[data-testid="alert-error"]').should('not.exist')

    // can create note
    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.save).should('be.disabled')
    cy.get(locators.sidebar.createNote.input).type('My first note')
    cy.get(locators.sidebar.createNote.save).click()

    // status bar is now enabled
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.statusBar.save).should('be.enabled')
    cy.get(locators.statusBar.delete).should('be.enabled')
    cy.get(locators.statusBar.savedOn).should('be.visible')

    // can edit the title
    cy.get(locators.editTitle.button).click()
    cy.get(locators.editTitle.input).should('have.value', 'My first note')
    cy.get(locators.editTitle.input).type(' - updated')
    // get the first child element of editor to trigger saving
    cy.get(locators.editor.content).children().first().click()

    // expect save notification from updating title rendered
    cy.get(locators.notification.save).should('exist')
    cy.get(locators.notification.save).should('not.exist') // wait for it to disappear

    // created note renders in sidebar
    cy.get(locators.sidebar.note).should('have.length', 1)
    cy.get(locators.sidebar.note).should('be.disabled') // disabled because it's already selected
    cy.get(locators.sidebar.note).should(
      'contain.text',
      'My first note - updated'
    )

    cy.get(locators.editor.content)
      .children()
      .first()
      .type('Lets add some content!')

    cy.get(locators.statusBar.save).click()
    cy.get(locators.notification.save).should('exist')
    cy.get(locators.notification.save).should('not.exist') // wait for it to disappear

    // can create another note
    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).type('My second note')
    cy.get(locators.sidebar.createNote.save).click()
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
    cy.get(locators.editor.content).children().first().should('have.value', '')
    // add content
    cy.get(locators.editor.content)
      .children()
      .first()
      .type('Second note content')

    // sidebar renders the two notes
    cy.get(locators.sidebar.note).should('have.length', 2)
    cy.get(locators.sidebar.note).eq(0).should('contain.text', 'My second note')
    cy.get(locators.sidebar.note).eq(0).should('be.disabled')
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
    cy.get(locators.editor.content).click()
    cy.get(locators.editor.content)
      .children()
      .first()
      .should('contain.text', 'Lets add some content!')

    // select the second note renders its content
    // because of the isDirty check to auto-save unsaved notes
    cy.get(locators.sidebar.note).eq(0).click()
    cy.get(locators.editTitle.button).click()
    cy.get(locators.editTitle.input).should('have.value', 'My second note')
    cy.get(locators.editor.content).click()
    cy.get(locators.editor.content)
      .children()
      .first()
      .should('contain.text', 'Second note content')

    // can delete a note
    cy.get(locators.statusBar.delete).click()
    cy.get('h2').should('contain', 'Delete')

    // can close modal and the editor is enabled again
    cy.get(locators.dialog.close).click()
    cy.get(locators.editor.content).children().first().type(' More content!')

    // and then the note can really be deleted
    cy.get(locators.statusBar.delete).click()
    cy.get(locators.deleteDialog.button).click()

    // renders the get started screen
    cy.get('h1').should('contain', 'Get started')

    // TODO:
    // editor state is disabled, no ability to modify get started text
    // ie: trying to modify the Get started text doesn't work

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
    // TODO: modify the note content again and save it
    // because this means the editor is FULLY ACTIVE AGAIN!

    // can delete first note and the app is reset to the get started screen
    cy.get(locators.statusBar.delete).click()
    cy.get(locators.deleteDialog.button).click()
    cy.get('h1').should('contain', 'Get started')
    cy.get(locators.statusBar.save).should('be.disabled')
    cy.get(locators.statusBar.delete).should('be.disabled')
    cy.get(locators.statusBar.savedOn).should('not.exist')
    cy.get(locators.sidebar.note).should('have.length', 0)
    // TODO: cannot modify the get started text

    // TODO
    //
    // FUTURE INFRASTRUCTURE DB SYNCING
    // ... (all db syncing interactions)
  })
})
