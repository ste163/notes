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
    cy.get(locators.editTitle.button).click()
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
  })
  // TODOs
  // - can delete a note and it routes to the next note in the list (or the empty selection view?)
  // - can delete all notes and see get started view again.
  // - the sidebar can be opened and closed, hiding and showing the note list
  //    - should add this once the query param has been added to the URL
  // - test that the mobile view works as expected (ie, mobile sidebar)
})
