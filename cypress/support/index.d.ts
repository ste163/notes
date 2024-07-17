/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Creates one note
     * @example
     * cy.createNote('My first note')
     */
    createNote(title: string): Chainable<unknown>
  }
}
