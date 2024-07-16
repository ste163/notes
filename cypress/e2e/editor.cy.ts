import { locators, dimensions, DEFAULT_WAIT, data } from '../constants'
import { clearIndexDb } from '../utils'

describe('editor', () => {
  beforeEach(async () => {
    await clearIndexDb()
    // by default, cypress always clears localStorage between test runs
  })

  it('editor menu buttons move to ellipsis menu properly on sidebar resize', () => {
    cy.viewport(1020, 768) // picking non-standard sizes here to test edge case
    cy.visit('/')
    cy.wait(DEFAULT_WAIT)

    // confirm that the ellipsis is not visible and only main buttons render
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')
    cy.get(locators.editor.menu.mainButtonSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.mainButtonSectionButtonCount.desktop
      )

    // dragging the sidebar to the right hides buttons
    cy.get(locators.sidebar.resizeHandle).trigger('mousedown', { which: 1 })
    cy.get(locators.sidebar.resizeHandle).trigger('mousemove', {
      clientX: 1000,
    })
    cy.get(locators.sidebar.resizeHandle).trigger('mouseup')
    cy.wait(DEFAULT_WAIT)

    // the fewest buttons render
    cy.get(locators.editor.menu.ellipsisButton).should('be.visible')
    cy.get(locators.editor.menu.mainButtonSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.mainButtonSectionButtonCount.mobile
      )

    // opening the ellipsis menu shows the other buttons
    cy.get(locators.editor.menu.ellipsisButton).click()
    cy.get(locators.editor.menu.ellipsisButtonSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.ellipsisButtonSectionButtonCount.mobile
      )

    // closing the sidebar renders all the buttons without ellipsis
    cy.get(locators.sidebar.close).click()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')
    cy.get(locators.editor.menu.mainButtonSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.mainButtonSectionButtonCount.desktop
      )
  })

  it('editor menu buttons move to the ellipsis menu properly on different viewport sizes', () => {
    cy.viewport(
      dimensions.desktop.viewPortWidth,
      dimensions.desktop.viewPortHeight
    )
    cy.visit('/')
    cy.wait(DEFAULT_WAIT)

    // TODO: move note creation to a command
    //
    // create a note so that we can interact with buttons
    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).type('test note')
    cy.get(locators.sidebar.createNote.save).click()

    // on desktop, all buttons are visible and no ellipsis button
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')
    cy.get(locators.editor.menu.mainButtonSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.mainButtonSectionButtonCount.desktop
      )

    // on tablet, X main buttons visible and ellipsis button visible
    cy.viewport(
      dimensions.tablet.viewPortWidth,
      dimensions.tablet.viewPortHeight
    )
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.editor.menu.ellipsisButton).should('be.visible')
    cy.get(locators.editor.menu.mainButtonSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.mainButtonSectionButtonCount.tablet
      )

    // opening the ellipsis menu shows the hidden buttons
    cy.get(locators.editor.menu.ellipsisButton).click()
    cy.get(locators.editor.menu.ellipsisButtonSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.ellipsisButtonSectionButtonCount.tablet
      )

    // clicking the first item closes the menu
    cy.get(locators.editor.menu.ellipsisButtonSection)
      .children()
      .first()
      .click()
    cy.get(locators.editor.menu.ellipsisButtonSection).should('not.be.visible')

    // opening the ellipsis menu and clicking outside it closes it
    cy.get(locators.editor.menu.ellipsisButton).click()
    cy.get('body').click()
    cy.get(locators.editor.menu.ellipsisButtonSection).should('not.be.visible')
  })

  it('when opening a dialog, the ellipsis menu retains its rendering state --- visible or hidden', () => {
    // on desktop, opening then closing a dialog does not render the ellipsis menu
    cy.viewport(
      dimensions.desktop.viewPortWidth,
      dimensions.desktop.viewPortHeight
    )
    cy.visit('/')
    cy.wait(DEFAULT_WAIT)

    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).type('test note')
    cy.get(locators.sidebar.createNote.save).click()

    // the correct main button count is shown without ellipsis
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')
    cy.get(locators.editor.menu.mainButtonSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.mainButtonSectionButtonCount.desktop
      )

    // opening and closing a dialog keeps the same result on desktop
    cy.get(locators.statusBar.database).click()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.dialog.close).click()
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')
    cy.get(locators.editor.menu.mainButtonSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.mainButtonSectionButtonCount.desktop
      )

    // on tablet, opening then closing the dialog keeps the ellipsis menu and main button section items the same
    cy.viewport(
      dimensions.tablet.viewPortWidth,
      dimensions.tablet.viewPortHeight
    )
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.editor.menu.ellipsisButton).should('be.visible')
    cy.get(locators.editor.menu.mainButtonSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.mainButtonSectionButtonCount.tablet
      )
  })
})
