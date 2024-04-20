import { describe, it } from 'vitest'

// TODO: will need to revisit testing approach
// because the footer contains independent components.
// Potentially build out a full mock footer to test all the scenarios

describe('footer', () => {
  it.todo('renders only the db setup and version when no data')

  // add the error section after tests + refactoring are in-place
  it.todo('renders error section when an error has occurred')

  it.todo(
    'when not connected to the database, renders local-only db and selected note information'
  )

  it.todo('when connected to database, renders remote db and note information')
})
