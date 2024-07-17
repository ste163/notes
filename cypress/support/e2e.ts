import { locators } from '../constants'

Cypress.Commands.add('createNote', (title: string) => {
  cy.get(locators.sidebar.createNote.button).click()
  cy.get(locators.sidebar.createNote.input).type(title)
  cy.get(locators.sidebar.createNote.save).click()
})
