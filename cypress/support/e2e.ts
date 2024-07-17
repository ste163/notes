import { locators } from '../constants'

Cypress.Commands.add('createNote', (title: string) => {
  cy.get(locators.sidebar.createNote.button).click()
  cy.get(locators.sidebar.createNote.input).type(title)
  cy.get(locators.sidebar.createNote.save).click()
})

Cypress.Commands.add('writeContent', (content: string) => {
  cy.get(locators.editor.content).children().first().type(content)
})

Cypress.Commands.add('validateContent', (expectedContent: string) => {
  cy.get(locators.editor.content)
    .children()
    .first()
    .should('have.text', expectedContent)
})
