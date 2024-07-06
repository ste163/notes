const locators = {
  createNote: {
    button: '[data-testid="create-note"]',
    input: '[data-testid="create-note-input"]',
    save: '[data-testid="create-note-save"]',
    cancel: '[data-testid="create-note-cancel"]',
  },
  dialog: {
    close: '[testid="dialog-close"]',
  },
  deleteDialog: {
    button: '[data-testid="delete-forever"]',
  },
  editor: {
    content: '#editor',
  },
  editTitle: {
    button: '[data-testid="edit-title-button"]',
    input: '[data-testid="edit-title-input"]',
  },
  notification: {
    save: '[data-testid="save-notification"]',
  },
  statusBar: {
    save: '[data-testid="save-note"]',
    delete: '[data-testid="delete-note"]',
    savedOn: '[data-testid="status-bar-saved-on"]',
    syncedOn: '[data-testid="status-bar-synced-on"]', // TODO: test when CouchDB is connected
  },
  sidebar: {
    note: '[data-testid="note-select"]',
  },
}

/**
 * Tests the main application flow; however,
 * this is not testing the connection to a CouchDB instance.
 * That requires more infrastructure setup as it needs to
 * create the docker container to run CouchDB.
 *
 * Current tests use IndexedDB.
 */
describe('application flow', () => {
  before(async () => {
    const clearIndexDb = async () => {
      const indexedDBs = await indexedDB.databases()
      indexedDBs.forEach(({ name }) => name && indexedDB.deleteDatabase(name))
    }
    await clearIndexDb()
  })

  it('can create, edit, write, select, and delete notes', () => {
    cy.visit('/')

    /**
     * Get started view without data, status bar actions are disabled
     */
    cy.get('h1').should('contain', 'Get started')
    cy.get(locators.statusBar.save).should('be.disabled')
    cy.get(locators.statusBar.delete).should('be.disabled')

    // TODO: fix this bug, sort on fields createdAt when using default index throws error during getAll
    // the app should load without any errors
    // need to wait for all async events to finish
    // cy.wait(1000)
    // cy.get('[data-testid="alert-error"]').should('not.exist')

    /**
     * Creating note and resetting the input
     */
    cy.get(locators.createNote.button).click()

    cy.get(locators.createNote.save).should('be.disabled')
    cy.get(locators.createNote.input).type('My first note')
    cy.get(locators.createNote.save).should('be.enabled')
    cy.get(locators.statusBar.savedOn).should('not.exist')

    // canceling stops note create and hides input
    cy.get(locators.createNote.cancel).click()
    cy.get(locators.createNote.input).should('not.exist')

    // re-opening has cleared inputted value
    cy.get(locators.createNote.button).click()
    cy.get(locators.createNote.input).should('have.value', '')
    cy.get(locators.createNote.save).should('be.disabled')

    // can create it
    cy.get(locators.createNote.input).type('My first note')
    cy.get(locators.createNote.save).click()

    /**
     * Adding note content and saving
     */
    // status bar is now enabled
    cy.get(locators.statusBar.save).should('be.enabled')
    cy.get(locators.statusBar.delete).should('be.enabled')
    cy.wait(500)
    cy.get(locators.statusBar.savedOn).should('be.visible')

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

    /**
     * Can create another note and swap between the two.
     * If the note is dirty, content is saved before swapping
     */
    cy.get(locators.createNote.button).click()
    cy.get(locators.createNote.input).type('My second note')
    cy.get(locators.createNote.save).click()

    cy.get(locators.notification.save).should('not.exist') // wait for it to disappear

    // should have opened the second note, check the title and content
    cy.wait(500)
    cy.get(locators.editTitle.button).click()
    cy.wait(500)
    cy.get(locators.editTitle.input).should('have.value', 'My second note')
    cy.get(locators.editor.content).click()
    // because the value wasn't changed, don't save
    cy.get(locators.notification.save).should('not.exist')

    // editor content empty
    cy.get(locators.editor.content).children().first().should('have.value', '')
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
    cy.wait(500) // cypress is moving too quickly, need to wait for the editor to render

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

    // swapping to the second note renders it and its content was saved
    // because the editor was dirty
    cy.get(locators.sidebar.note).eq(0).click()
    cy.get(locators.editTitle.button).click()
    cy.get(locators.editTitle.input).should('have.value', 'My second note')
    cy.get(locators.editor.content).click()
    cy.get(locators.editor.content)
      .children()
      .first()
      .should('contain.text', 'Second note content')

    /**
     * Can delete a note
     */
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

    // can delete first note and the app is reset to the get started screen
    cy.get(locators.statusBar.delete).click()
    cy.get(locators.deleteDialog.button).click()
    cy.get('h1').should('contain', 'Get started')
    cy.get(locators.statusBar.save).should('be.disabled')
    cy.get(locators.statusBar.delete).should('be.disabled')
    cy.get(locators.statusBar.savedOn).should('not.exist')
    cy.get(locators.sidebar.note).should('have.length', 0)
  })
  // TODOs:
  // - BUG that tests need to solve for: the savedOn date doesn't get removed if there is no note.
  // it always renders. So I need to setup a test id for that and check its existence.
  // - the sidebar can be opened and closed, hiding and showing the note list
  //    - should add this once the query param has been added to the URL
  // - test that the mobile view works as expected (ie, mobile sidebar)
})
