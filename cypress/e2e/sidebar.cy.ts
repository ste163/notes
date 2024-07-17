import { locators, DEFAULT_WAIT, dimensions } from '../constants'
import { clearIndexDb } from '../utils'

describe('sidebar', () => {
  beforeEach(async () => {
    await clearIndexDb()
    // by default, cypress always clears localStorage between test runs
  })

  it('handles creating and selecting a note on small screen sizes', () => {
    cy.viewport(dimensions.small.viewPortWidth, dimensions.small.viewPortHeight)
    cy.visit('/')

    // when visiting the page, the sidebar is full screen. Editor is not visible
    cy.get(locators.sidebar.mainElement).should('be.visible')
    cy.get(locators.editor.content).should('not.be.visible')

    // creating a note closes the sidebar on small screens
    cy.createNote('My first note')
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.sidebar.mainElement).should('not.exist')
    cy.get(locators.editor.content).should('be.visible')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('Some content...')
    cy.get(locators.statusBar.save).click()

    cy.wait(DEFAULT_WAIT)
    // reloading the page renders the note and its content, and no sidebar
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.sidebar.mainElement).should('not.exist')
    cy.validateContent('Some content...')

    // can create a new note and select it
    // open the sidebar from status bar
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.get(locators.sidebar.mainElement).should('be.visible')
    cy.get(locators.editor.content).should('not.be.visible')
    cy.createNote('My second note')
    cy.wait(DEFAULT_WAIT)

    // TODO (need to implement)
    // clicking the second note closes the sidebar
  })

  // TODO
  //
  // RESIZING (this is actually done through viewport commands, not dragging)
  // - resizing viewport from desktop to mobile with sidebar open makes sidebar fullscreen
  // - if the sidebar is open, in mobile, it stay open in desktop
  //    moving the window back to mobile, the sidebar is still open
  // - if the sidebar is closed in mobile, it stays closed in desktop
  //    moving the window back to mobile, the sidebar is still closed

  it.skip('handles creating a note on larger screen sizes', () => {
    cy.visit('/')
    // tests all scenarios on note creating
    //
    // TODO: what happens when you:
    // - click create note again?
    // - have the note input open but close then reopen the sidebar?
    // ADD TESTS FOR THESE WITH EXPECTATIONS
    //
    // TODO: creating a note DOES NOT AUTO CLOSE THE SIDEBAR on wide screens

    cy.get(locators.sidebar.createNote.button).click()

    // no value, so saving is disabled
    cy.get(locators.sidebar.createNote.save).should('be.disabled')
    cy.get(locators.sidebar.createNote.input).type('My first note')
    cy.get(locators.sidebar.createNote.save).should('be.enabled')
    // removing the value disabled save again
    // TODO: implement the above comment

    // canceling stops note create and hides input
    cy.get(locators.sidebar.createNote.cancel).click()
    cy.get(locators.sidebar.createNote.input).should('not.exist')

    // re-opening has cleared inputted value
    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).should('have.value', '')
    cy.get(locators.sidebar.createNote.save).should('be.disabled')
  })

  it.skip('tracks sidebar open/closed state across page reloads', () => {
    cy.visit('/')
    // default sidebar value added
    cy.location('search').should('eq', '?sidebar=open')

    // sidebar was opened and stays open on refresh
    cy.get(locators.sidebar.createNote.button).should('be.visible')
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.location('search').should('eq', '?sidebar=open')
    cy.get(locators.sidebar.createNote.button).should('be.visible')

    // closing sidebar from sidebar close button
    cy.get(locators.sidebar.close).click()
    cy.location('search').should('eq', '?sidebar=close')
    cy.get(locators.sidebar.createNote.button).should('not.exist')
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.location('search').should('eq', '?sidebar=close')
    cy.get(locators.sidebar.createNote.button).should('not.exist')

    // handle sidebar open close from status bar
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.location('search').should('eq', '?sidebar=open')
    cy.get(locators.sidebar.createNote.button).should('be.visible')
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.location('search').should('eq', '?sidebar=open')
    cy.get(locators.sidebar.createNote.button).should('be.visible')

    // and we can close it
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.location('search').should('eq', '?sidebar=close')
    cy.get(locators.sidebar.createNote.button).should('not.exist')
  })

  it.skip('resizing the sidebar saves it to local storage', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.wait(DEFAULT_WAIT)
    // check the sidebar width is the default
    cy.get(locators.sidebar.mainElement).should('have.css', 'width', '170px')
    // no ellipsis button as the editor is wide
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')

    // drag and move the sidebar
    cy.get(locators.sidebar.resizeHandle).trigger('mousedown', { which: 1 })
    cy.get(locators.sidebar.resizeHandle).trigger('mousemove', { clientX: 400 })
    cy.get(locators.sidebar.resizeHandle).trigger('mouseup')

    cy.get(locators.sidebar.mainElement).should('have.css', 'width', '400px')

    // reload the page
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.sidebar.mainElement).should('have.css', 'width', '400px')
    // ellipsis button renders as the editor was resized
    cy.get(locators.editor.menu.ellipsisButton).should('be.visible')
  })
})
