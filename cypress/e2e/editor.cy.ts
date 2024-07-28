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

    // create a note so the editor is enabled
    cy.createNote('test note')

    // confirm that the ellipsis is not visible and only main buttons render
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')
    cy.get(locators.editor.menu.mainSection)
      .children()
      .should('have.length', data.expected.editor.mainToolbarButtonCount.large)

    // dragging the sidebar to the right hides buttons
    cy.get(locators.sidebar.resizeHandle).trigger('mousedown', { which: 1 })
    cy.get(locators.sidebar.resizeHandle).trigger('mousemove', {
      clientX: 1000,
    })
    cy.get(locators.sidebar.resizeHandle).trigger('mouseup')
    cy.wait(DEFAULT_WAIT)

    // the fewest buttons render
    cy.get(locators.editor.menu.ellipsisButton).should('be.visible')
    cy.get(locators.editor.menu.mainSection)
      .children()
      .should('have.length', data.expected.editor.mainToolbarButtonCount.small)

    // opening the ellipsis menu shows the other buttons
    cy.get(locators.editor.menu.ellipsisButton).click()
    cy.get(locators.editor.menu.ellipsisSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.ellipsisToolbarButtonCount.small
      )

    // and the first item is H1, so that we know items were ordered correctly
    cy.get(locators.editor.menu.ellipsisSection)
      .children()
      .eq(0)
      .should('contain.text', 'Heading 1')

    // closing the sidebar renders all the buttons without ellipsis
    cy.get(locators.sidebar.close).click()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')
    cy.get(locators.editor.menu.mainSection)
      .children()
      .should('have.length', data.expected.editor.mainToolbarButtonCount.large)
  })

  it('editor menu buttons move to the ellipsis menu properly on different viewport sizes', () => {
    cy.viewport(dimensions.large.viewPortWidth, dimensions.large.viewPortHeight)
    cy.visit('/')
    cy.wait(DEFAULT_WAIT)

    // create a note so that we can interact with buttons
    cy.createNote('test note')

    // on large size, all buttons are visible and no ellipsis button
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')
    cy.get(locators.editor.menu.mainSection)
      .children()
      .should('have.length', data.expected.editor.mainToolbarButtonCount.large)

    // on medium, some main buttons visible and ellipsis button is visible
    cy.viewport(
      dimensions.medium.viewPortWidth,
      dimensions.medium.viewPortHeight
    )
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.editor.menu.ellipsisButton).should('be.visible')
    cy.get(locators.editor.menu.mainSection)
      .children()
      .should('have.length', data.expected.editor.mainToolbarButtonCount.medium)

    // opening the ellipsis menu shows the hidden buttons
    cy.get(locators.editor.menu.ellipsisButton).click()
    cy.get(locators.editor.menu.ellipsisSection)
      .children()
      .should(
        'have.length',
        data.expected.editor.ellipsisToolbarButtonCount.medium
      )

    // clicking the first ellipsis menu item closes the menu
    cy.get(locators.editor.menu.ellipsisSection).children().first().click()
    cy.get(locators.editor.menu.ellipsisSection).should('not.be.visible')

    // opening the ellipsis menu and clicking outside it closes it
    cy.get(locators.editor.menu.ellipsisButton).click()
    cy.get('body').click()
    cy.get(locators.editor.menu.ellipsisSection).should('not.be.visible')
  })

  it('when opening a dialog, the ellipsis menu retains its rendering state: visible or hidden', () => {
    // on large size, opening then closing a dialog does not render the ellipsis menu
    cy.viewport(dimensions.large.viewPortWidth, dimensions.large.viewPortHeight)
    cy.visit('/')
    cy.wait(DEFAULT_WAIT)

    cy.createNote('test note')

    // the correct main button count is shown without ellipsis
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')
    cy.get(locators.editor.menu.mainSection)
      .children()
      .should('have.length', data.expected.editor.mainToolbarButtonCount.large)

    // opening and closing a dialog keeps the same result on large size
    cy.get(locators.statusBar.database).click()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.dialog.close).click()
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')
    cy.get(locators.editor.menu.mainSection)
      .children()
      .should('have.length', data.expected.editor.mainToolbarButtonCount.large)

    // on medium size, opening then closing the dialog keeps the ellipsis menu and main button section items the same
    cy.viewport(
      dimensions.medium.viewPortWidth,
      dimensions.medium.viewPortHeight
    )
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.editor.menu.ellipsisButton).should('be.visible')
    cy.get(locators.editor.menu.mainSection)
      .children()
      .should('have.length', data.expected.editor.mainToolbarButtonCount.medium)
  })

  it('handles debounced auto-saving when changes are made', () => {
    cy.viewport(dimensions.large.viewPortWidth, dimensions.large.viewPortHeight)
    cy.visit('/')
    cy.wait(DEFAULT_WAIT)

    cy.createNote('test note')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('Here is some unsaved content')

    // wait a bit for the save notification to appear
    cy.wait(DEFAULT_WAIT)
    cy.wait(DEFAULT_WAIT)

    // because debounced saved, reloading the page should render the same note
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.validateContent('Here is some unsaved content')
  })
})
