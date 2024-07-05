describe('application flow', () => {
  it('renders get started view when no notes created', () => {
    cy.visit('/')
    cy.get('h1').should('contain', 'Get started')
  })

  // when there are no notes,
  // see get started view.
  // can create a note and that routes to the newly created note.
  // can edit the note title and it shows up in sidebar and title section (and renders save)
  // can edit note content and save it (renders save notification)
  // can create another note and swap between the two. (notes save between swapping if dirty)
  // can delete a note and it routes to the next note in the list (or the empty selection view?)
  // can delete all notes and see get started view again.
  //
  // once this is all in place, add tests with a docker-based pouchdb instance running
  // and test the connection and syncing with all of these again.
})
