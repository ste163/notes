/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Creates one note
     * @example
     * cy.createNote('My first note')
     */
    createNote(title: string): Chainable<unknown>

    /**
     * Write content to the editor
     * @example
     * cy.writeContent('Lets add some content!')
     */
    writeContent(content: string): Chainable<unknown>

    /**
     * Validate the content in the editor
     * @example
     * cy.validateContent('Lets add some content!')
     */
    validateContent(expectedContent: string): Chainable<unknown>
  }
}
