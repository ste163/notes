const locators = {
  createNote: {
    button: '[data-testid="create-note"]',
    input: '[data-testid="create-note-input"]',
    save: '[data-testid="create-note-save"]',
    cancel: '[data-testid="create-note-cancel"]',
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
    save: '[data-testid="save-note-button"]',
    delete: '[data-testid="note-delete-button"]',
  },
  sidebar: {
    note: '[data-testid="note-select-button"]',
  },
}

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
    cy.get('h1').should('contain', 'Get started')

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
    cy.get(locators.editTitle.button).click()
    cy.get(locators.editTitle.input).should('have.value', 'My first note')

    cy.get(locators.editTitle.input).type(' - updated')
    // get the first child element of editor to trigger saving
    cy.get(locators.editor.content).children().first().click()

    // expect save notification from updating title rendered
    cy.get(locators.notification.save).should('exist')

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
  })
  // TODOs for the first test
  // can edit the note title and it shows up in sidebar and title section (and renders save)
  // can edit note content and save it (from save button in status bar) (renders save notification)
  // can create another note and swap between the two. (notes save between swapping if dirty)
  // - cannot click an already selected note
  // can delete a note and it routes to the next note in the list (or the empty selection view?)
  // can delete all notes and see get started view again.
  // TEST that the sidebar can be opened and closed, hiding and showing the note list
  //
  // Eventually, setup the docker container to include a pouchdb instance
  // and test the connection and syncing works as expected

  // need some mobile only tests for the sidebar being full screen if no note selected
})
