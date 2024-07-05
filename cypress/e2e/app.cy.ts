describe('application flow', () => {
  before(async () => {
    const indexedDBs = await indexedDB.databases()
    indexedDBs.forEach(({ name }) => name && indexedDB.deleteDatabase(name))
  })

  it('can create, edit, write, select, and delete notes', () => {
    cy.visit('/')
    cy.get('h1').should('contain', 'Get started')
    // TODO: fix this bug, sort on fields createdAt when using default index throws error during getAll
    // the app should load without any errors
    // need to wait for all async events to finish
    // cy.wait(1000)
    // cy.get('[data-testid="alert-error"]').should('not.exist')

    // creating a note works and can be reset/canceled
    cy.get('[data-testid="create-note"]').click()

    cy.get('[data-testid="create-note-save"]').should('be.disabled')
    cy.get('[data-testid="create-note-input"]').type('My first note')
    cy.get('[data-testid="create-note-save"]').should('be.enabled')

    // canceling stops note create and hides input
    cy.get('[data-testid="create-note-cancel"]').click()
    cy.get('[data-testid="create-note-input"]').should('not.exist')

    // re-opening has cleared inputted value
    cy.get('[data-testid="create-note"]').click()
    cy.get('[data-testid="create-note-input"]').should('have.value', '')
    cy.get('[data-testid="create-note-save"]').should('be.disabled')

    // can save note
    cy.get('[data-testid="create-note-input"]').type('My first note')
    cy.get('[data-testid="create-note-save"]').click()

    // can add note content and save it
    cy.get('[data-testid="edit-title-button"]').click()
    cy.get('[data-testid="edit-title-input"]').should(
      'have.value',
      'My first note'
    )

    cy.get('[data-testid="edit-title-input"]').type(' - updated')
    // get the first child element of editor
    cy.get('#editor').children().first().click()

    // expect save notification from updating title rendered
    cy.get('[data-testid="save-notification"]').should('exist')
    // TODO note title in sidebar should have rendered

    cy.get('#editor').children().first().type('My first note!')
  })
  // TODOs for the first test
  // can edit the note title and it shows up in sidebar and title section (and renders save)
  // can edit note content and save it (from save button in status bar) (renders save notification)
  // can create another note and swap between the two. (notes save between swapping if dirty)
  // can delete a note and it routes to the next note in the list (or the empty selection view?)
  // can delete all notes and see get started view again.
  // TEST that the sidebar can be opened and closed, hiding and showing the note list
  //
  // Eventually, setup the docker container to include a pouchdb instance
  // and test the connection and syncing works as expected
})
