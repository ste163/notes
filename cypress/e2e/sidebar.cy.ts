import { locators, DEFAULT_WAIT, dimensions, data } from '../constants'
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
    cy.writeContent('First note content...')
    cy.get(locators.statusBar.save).click()

    // reloading the page renders the note and its content, and no sidebar
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.sidebar.mainElement).should('not.exist')
    cy.validateContent('First note content...')

    // can create a new note and select it
    // open the sidebar from status bar
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.get(locators.sidebar.mainElement).should('be.visible')
    cy.get(locators.editor.content).should('not.be.visible')
    cy.createNote('My second note')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('Second note content...')
    // not saving as the note will not be re-selected from a 'code' perspective

    // clicking the second note closes the sidebar only
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.get(locators.sidebar.note).eq(0).click()
    cy.validateContent('Second note content...')
  })

  it('handles resizing the viewport with the sidebar open', () => {
    // starting on large screen sizes
    cy.viewport(dimensions.large.viewPortWidth, dimensions.large.viewPortHeight)
    cy.visit('/')

    // the sidebar is open by default
    // create a note
    cy.createNote('My first note')
    cy.wait(DEFAULT_WAIT)

    // the sidebar is still open before resizing
    cy.get(locators.sidebar.mainElement).should('be.visible')

    // resizing to a smaller screen size
    cy.viewport(dimensions.small.viewPortWidth, dimensions.small.viewPortHeight)
    cy.wait(DEFAULT_WAIT)

    // because the sidebar is open, make it full screen and the editor is not visible
    cy.get(locators.sidebar.mainElement).should('be.visible')
    cy.get(locators.editor.content).should('not.be.visible')

    // resizing to a medium screen size should keep the sidebar open and show editor
    cy.viewport(
      dimensions.medium.viewPortWidth,
      dimensions.medium.viewPortHeight
    )
    cy.wait(DEFAULT_WAIT)

    cy.get(locators.sidebar.mainElement).should('be.visible')
    cy.get(locators.editor.content).should('be.visible')
  })

  it('handles resizing the viewport with the sidebar closed', () => {
    // starting on large screen sizes
    cy.viewport(dimensions.large.viewPortWidth, dimensions.large.viewPortHeight)
    cy.visit('/')

    // the sidebar is open by default
    // create a note
    cy.createNote('My first note')
    cy.wait(DEFAULT_WAIT)

    // close the sidebar
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.get(locators.sidebar.mainElement).should('not.exist')

    // when resizing to a smaller screen, sidebar should stay hidden
    cy.viewport(dimensions.small.viewPortWidth, dimensions.small.viewPortHeight)
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.sidebar.mainElement).should('not.exist')
    // editor is visible
    cy.get(locators.editor.content).should('be.visible')

    // resizing to a medium screen size should keep the sidebar closed and show editor
    cy.viewport(
      dimensions.medium.viewPortWidth,
      dimensions.medium.viewPortHeight
    )
    cy.wait(DEFAULT_WAIT)

    cy.get(locators.sidebar.mainElement).should('not.exist')
    cy.get(locators.editor.content).should('be.visible')
  })

  it('handles creating a note on larger screen sizes', () => {
    cy.visit('/')
    // tests all scenarios on note creating

    cy.get(locators.sidebar.createNote.button).click()

    // no value, so saving is disabled
    cy.get(locators.sidebar.createNote.save).should('be.disabled')
    cy.get(locators.sidebar.createNote.input).type('My first note')
    cy.get(locators.sidebar.createNote.save).should('be.enabled')
    // removing the value disabled save again
    cy.get(locators.sidebar.createNote.input).clear()
    cy.get(locators.sidebar.createNote.save).should('be.disabled')
    // typing a value enables save again
    cy.get(locators.sidebar.createNote.input).type('My first note')

    // canceling stops note create and hides input
    cy.get(locators.sidebar.createNote.cancel).click()
    cy.get(locators.sidebar.createNote.input).should('not.exist')

    // re-opening has cleared inputted value
    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).should('have.value', '')
    cy.get(locators.sidebar.createNote.save).should('be.disabled')

    // adding a title and hitting the create button again removes the input
    // and clicking create again has reset the input
    cy.get(locators.sidebar.createNote.input).type('My first note')
    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).should('not.exist')
    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).should('have.value', '')

    // opening the create note input, adding a title, but closing the sidebar and then reopening it
    // has closed the input. Opening the input again does not render the input title
    cy.get(locators.sidebar.createNote.input).type('My first note')
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.get(locators.sidebar.createNote.input).should('not.exist')
    cy.get(locators.sidebar.createNote.button).click()
    cy.get(locators.sidebar.createNote.input).should('have.value', '')

    // creating a note does not auto-close the sidebar on wide screen
    cy.get(locators.sidebar.createNote.input).type('My first note')
    cy.get(locators.sidebar.createNote.save).click()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.sidebar.mainElement).should('be.visible')
  })

  it('handles deleting a note on different screen sizes by right click', () => {
    cy.viewport(dimensions.large.viewPortWidth, dimensions.large.viewPortHeight)
    cy.visit('/')

    cy.createNote('My first note')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('First note content...')
    cy.wait(DEFAULT_WAIT)
    cy.createNote('My second note')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('Second note content...')
    cy.wait(DEFAULT_WAIT)
    cy.createNote('My third note')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('Third note content...')
    cy.wait(DEFAULT_WAIT)

    // by this point the third note is rendered
    // right clicking on the first note opens the delete dialog with the note title rendered
    cy.get(locators.sidebar.note).eq(2).rightclick()
    cy.get(locators.dialog.deleteDialog.header).should(
      'be.contain',
      'My first note'
    )
    // delete the note
    cy.get(locators.dialog.deleteDialog.confirmButton).click()
    cy.wait(DEFAULT_WAIT)
    // render the getting started section as there is no data
    cy.validateContent(data.expected.editor.content.default)

    // user can't edit the get started text
    cy.get(locators.editor.content)
      .children()
      .first()
      .invoke('attr', 'contenteditable')
      .should('eq', 'false')

    // select the third note
    cy.get(locators.sidebar.note).eq(0).click()
    cy.validateContent('Third note content...')

    // right click the third note and delete it
    cy.get(locators.sidebar.note).eq(0).rightclick()
    cy.get(locators.dialog.deleteDialog.header).should(
      'be.contain',
      'My third note'
    )
    cy.get(locators.dialog.deleteDialog.confirmButton).click()
    cy.wait(DEFAULT_WAIT)

    // only the second note is left
    cy.get(locators.sidebar.note).should('have.length', 1)
    cy.get(locators.sidebar.note).eq(0).should('be.contain', 'My second note')

    // resize to a smaller screen size
    cy.viewport(dimensions.small.viewPortWidth, dimensions.small.viewPortHeight)
    cy.wait(DEFAULT_WAIT)
    // create the first and third notes again
    cy.createNote('My first note')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('First note content...')
    cy.wait(DEFAULT_WAIT)
    // open sidebar
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.createNote('My third note')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('Third note content...')
    cy.wait(DEFAULT_WAIT)

    // open sidebar
    cy.get(locators.statusBar.sidebarToggle).click()

    // right click opens the dialog
    cy.get(locators.sidebar.note).eq(1).rightclick()
    cy.get(locators.dialog.deleteDialog.header).should(
      'be.contain',
      'My first note'
    )
    // delete the note
    cy.get(locators.dialog.deleteDialog.confirmButton).click()
    cy.wait(DEFAULT_WAIT)

    // the delete dialog is no longer rendered
    cy.get(locators.dialog.deleteDialog.header).should('not.exist')

    // sidebar is still opened with only the two remaining notes
    cy.get(locators.sidebar.note).should('have.length', 2)
    cy.get(locators.sidebar.note).eq(0).should('be.contain', 'My third note')
    cy.get(locators.sidebar.note).eq(1).should('be.contain', 'My second note')

    // refreshing the page keeps the sidebar opened because no note is selected
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.sidebar.mainElement).should('be.visible')
    cy.get(locators.editor.content).should('not.be.visible')
  })

  it('on small screen size, allows for deleting notes by long-press', () => {
    cy.viewport(dimensions.small.viewPortWidth, dimensions.small.viewPortHeight)
    cy.visit('/')

    // create a few notes
    cy.createNote('My first note')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('First note content...')
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.createNote('My second note')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('Second note content...')
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.createNote('My third note')
    cy.wait(DEFAULT_WAIT)
    cy.writeContent('Third note content...')
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.statusBar.sidebarToggle).click()
    cy.wait(DEFAULT_WAIT)

    // simulate a long press tap
    cy.get(locators.sidebar.note)
      .eq(2)
      .trigger('touchstart', { which: 1 })
      .wait(2500)
      .trigger('touchend', { force: true })
    cy.wait(DEFAULT_WAIT)

    cy.get(locators.dialog.deleteDialog.header).should(
      'be.contain',
      'My first note'
    )
    cy.get(locators.dialog.deleteDialog.confirmButton).click()
    cy.wait(DEFAULT_WAIT)

    // only the second and third notes are left
    cy.get(locators.sidebar.note).should('have.length', 2)
    cy.get(locators.sidebar.note).eq(0).should('be.contain', 'My third note')
    cy.get(locators.sidebar.note).eq(1).should('be.contain', 'My second note')

    // refreshing the page keeps the sidebar open
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.sidebar.mainElement).should('be.visible')
    cy.get(locators.sidebar.note).should('have.length', 2)
  })

  it('tracks sidebar open/closed state across page reloads', () => {
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
    cy.get(locators.statusBar.sidebarToggle).click()
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

  it('resizing the sidebar saves it to local storage', () => {
    cy.clearLocalStorage()
    cy.visit('/')
    cy.wait(DEFAULT_WAIT)
    // check the sidebar width is the default
    cy.get(locators.sidebar.mainElement).should(
      'have.css',
      'width',
      '229.99375px'
    )
    // no ellipsis button as the editor is wide
    cy.get(locators.editor.menu.ellipsisButton).should('not.be.visible')

    // drag and move the sidebar
    cy.get(locators.sidebar.resizeHandle).trigger('mousedown', { which: 1 })
    cy.get(locators.sidebar.resizeHandle).trigger('mousemove', { clientX: 400 })
    cy.get(locators.sidebar.resizeHandle).trigger('mouseup')

    cy.get(locators.sidebar.mainElement).should(
      'have.css',
      'width',
      '399.99375px'
    )

    // reload the page
    cy.reload()
    cy.wait(DEFAULT_WAIT)
    cy.get(locators.sidebar.mainElement).should(
      'have.css',
      'width',
      '399.99375px'
    )
    // ellipsis button renders as the editor was resized
    cy.get(locators.editor.menu.ellipsisButton).should('be.visible')
  })
})
