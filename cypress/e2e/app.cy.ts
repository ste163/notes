const locators = {
  deleteDialog: {
    button: '[data-testid="delete-forever"]',
  },
  dialog: {
    close: '[testid="dialog-close"]',
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
    database: '[data-testid="setup-database"]',
    delete: '[data-testid="delete-note"]',
    save: '[data-testid="save-note"]',
    sidebarToggle: '[data-testid="status-bar-sidebar-toggle"]',
    savedOn: '[data-testid="status-bar-saved-on"]',
    syncedOn: '[data-testid="status-bar-synced-on"]', // TODO: test when CouchDB is connected
  },
  sidebar: {
    close: '[data-testid="close-sidebar"]',
    createNote: {
      button: '[data-testid="create-note"]',
      input: '[data-testid="create-note-input"]',
      save: '[data-testid="create-note-save"]',
      cancel: '[data-testid="create-note-cancel"]',
    },
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
  beforeEach(async () => {
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
    cy.get(locators.sidebar.createNote.button).click()

    cy.get(locators.sidebar.createNote.save).should('be.disabled')
    cy.get(locators.sidebar.createNote.input).type('My first note')
    cy.get(locators.sidebar.createNote.save).should('be.enabled')
    cy.get(locators.statusBar.savedOn).should('not.exist')

    // canceling stops note create and hides input
    cy.get(locators.sidebar.createNote.cancel).click()
    cy.get(locators.sidebar.createNote.input).should('not.exist')

    // re-opening has cleared inputted value
    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).should('have.value', '')
    cy.get(locators.sidebar.createNote.save).should('be.disabled')

    // can create it
    cy.get(locators.sidebar.createNote.input).type('My first note')
    cy.get(locators.sidebar.createNote.save).click()

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
    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).type('My second note')
    cy.get(locators.sidebar.createNote.save).click()

    cy.get(locators.notification.save).should('not.exist') // wait for it to disappear

    // should have opened the second note, check the title and content
    cy.wait(500)
    cy.get(locators.editTitle.button).click()
    cy.wait(1000)
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

  it('dialogs render properly if no note selected', () => {
    cy.visit('/')

    // database dialog renders properly on reload
    cy.get(locators.statusBar.database).click()
    cy.get('h2').should('contain', 'Database')
    cy.reload()
    cy.wait(500)
    cy.get('h2').should('contain', 'Database')

    // closing the dialog and reloading does not render it
    cy.get(locators.dialog.close).click()
    cy.get('h2').should('not.exist', 'Database')
    cy.reload()
    cy.wait(500)
    cy.get('h2').should('not.exist', 'Database')

    // delete note dialog should not render as no note was selected
    cy.get(locators.statusBar.delete).should('be.disabled')
    // and visiting the url directly should not render the dialog
    cy.visit('/?dialog=delete')
    cy.wait(500)
    cy.get('h2').should('not.exist', 'Delete')
  })

  it('dialogs render properly if a note is selected', () => {
    cy.visit('/')

    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).type('Dialog test note')
    cy.get(locators.sidebar.createNote.save).click()

    cy.get(locators.statusBar.database).click()

    // database dialog can be reloaded
    cy.get('h2').should('contain', 'Database')
    cy.reload()
    cy.wait(500)
    cy.get('h2').should('contain', 'Database')

    // closing the dialog and reloading does not render it
    cy.get(locators.dialog.close).click()
    cy.get('h2').should('not.exist', 'Database')
    cy.reload()
    cy.wait(500)
    cy.get('h2').should('not.exist', 'Database')

    // delete note dialog opens properly
    cy.wait(500)
    cy.get(locators.statusBar.delete).click()
    cy.get('h2').should('contain', 'Delete')
    cy.reload()
    cy.wait(500)
    cy.get('h2').should('contain', 'Delete')

    // closing the dialog and reloading does not render it
    cy.get(locators.dialog.close).click()
    cy.get('h2').should('not.exist', 'Delete')
    cy.reload()
    cy.wait(500)
    cy.get('h2').should('not.exist', 'Delete')
  })

  it('tracks sidebar open/closed state across page reloads', () => {
    cy.visit('/')
    // default sidebar value added
    cy.location('search').should('eq', '?sidebar=open')

    // sidebar was opened and stays open on refresh
    cy.get(locators.sidebar.createNote.button).should('be.visible')
    cy.reload()
    cy.wait(500)
    cy.location('search').should('eq', '?sidebar=open')
    cy.get(locators.sidebar.createNote.button).should('be.visible')

    // closing sidebar from sidebar close button
    cy.get(locators.sidebar.close).click()
    cy.location('search').should('eq', '?sidebar=close')
    cy.get(locators.sidebar.createNote.button).should('not.exist')
    cy.reload()
    cy.wait(500)
    cy.location('search').should('eq', '?sidebar=close')
    cy.get(locators.sidebar.createNote.button).should('not.exist')

    // handle sidebar open close from status bar
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.location('search').should('eq', '?sidebar=open')
    cy.get(locators.sidebar.createNote.button).should('be.visible')
    cy.reload()
    cy.wait(500)
    cy.location('search').should('eq', '?sidebar=open')
    cy.get(locators.sidebar.createNote.button).should('be.visible')

    // and we can close it
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.location('search').should('eq', '?sidebar=close')
    cy.get(locators.sidebar.createNote.button).should('not.exist')
  })

  // TODOs
  //
  // MOBILE
  // - no selected note shows the sidebar only with the create note button
  // - creating a note opens the selected note in the editor
  // - refreshing the page opens to the selected note with the sidebar hidden
  // - opening the sidebar and refreshing keeps the sidebar open
  //
  // RESIZING
  // - if the sidebar is open, in mobile, it stay open in desktop
  //   - moving the window back to mobile, the sidebar is still open
  // - if the sidebar is closed in mobile, it stays closed in desktop
  //   - moving the window back to mobile, the sidebar is still closed
  //
  // FUTURE INFRASTRUCTURE DB SYNCING
  // ... (all db syncing interactions)
})
