import { locators, DEFAULT_WAIT } from '../constants'
import { clearIndexDb } from '../utils'

describe('dialogs', () => {
  beforeEach(async () => {
    await clearIndexDb()
    // by default, cypress always clears localStorage between test runs
  })

  it('dialogs render properly if no note selected', () => {
    cy.visit('/')

    // database dialog renders properly on reload
    cy.get(locators.statusBar.database).click()
    cy.get('h2').should('contain', 'Database')
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get('h2').should('contain', 'Database')

    // closing the dialog and reloading does not render it
    cy.get(locators.dialog.close).click()
    cy.get('h2').should('not.exist', 'Database')
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get('h2').should('not.exist', 'Database')

    // delete note dialog should not render as no note was selected
    cy.get(locators.statusBar.delete).should('be.disabled')

    // and visiting the url directly should not render the dialog
    cy.visit('/?dialog=delete')
    cy.wait(DEFAULT_WAIT)
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
    cy.wait(DEFAULT_WAIT)
    cy.get('h2').should('contain', 'Database')

    // closing the dialog and reloading does not render it
    cy.get(locators.dialog.close).click()
    cy.get('h2').should('not.exist', 'Database')
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get('h2').should('not.exist', 'Database')

    // delete note dialog opens properly
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.statusBar.delete).click()
    cy.get('h2').should('contain', 'Delete')
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get('h2').should('contain', 'Delete')

    // closing the dialog and reloading does not render it
    cy.get(locators.dialog.close).click()
    cy.get('h2').should('not.exist', 'Delete')
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get('h2').should('not.exist', 'Delete')
  })
})
