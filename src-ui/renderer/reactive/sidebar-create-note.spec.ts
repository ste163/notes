import { describe, it, expect } from 'vitest'
import { Window } from 'happy-dom'
import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { renderSidebarCreateNote } from './sidebar-create-note'

// TODO: probably move this to a test-util
// so that I can have one place to manage all of the window state and types.
// can pass in component, props, an optional containerId, and then return the within function for full access

/**
 * Render a component and its props
 * in a simulated window and document
 *
 * @param renderFunction component's render function
 * @param props component's props
 * @returns the "within" instance from testing-library/dom for this component
 * that allows for destructuring the getByRole, queryByRole, etc.
 */
const renderComponent = <T extends { [key: string]: unknown }>(
  renderFunction: (props: T) => void,
  props: T
) => {
  /**
   * Setup the context for the component to render within
   */
  const window = new Window()
  globalThis.window = window as Window & typeof globalThis.window
  globalThis.document = window.document as unknown as Document &
    typeof globalThis.document

  // TODO: the id for this gets passed in
  globalThis.window.document.body.innerHTML =
    '<div id="sidebar-top-menu"></div>'

  renderFunction(props)

  return within(window.document.body as unknown as HTMLElement)
}

describe('create-note', () => {
  it('throws error if container is not found', () => {
    // TODO: use the render abstraction once its done
    try {
      renderSidebarCreateNote({
        noteTitle: '',
        isCreateNoteLoading: false,
        createError: '',
      })
    } catch (error) {
      expect((error as Error).message).toBe(
        'Unable to find sidebar-top-menu container'
      )
    }
  })

  it.todo('if create error, render full input and the error')

  it.todo(
    'renders loading state if isCreateNoteLoading and no error'
    // ensure the save not button is disabled (and maybe also the cancel button?)
  )

  it.todo('renders the loading state and spinner if error is passed in')

  it('renders base input that can cancel and submit a note, if not loading and no error', async () => {
    const { getByRole, queryByRole } = renderComponent(
      renderSidebarCreateNote,
      {
        noteTitle: '',
        isCreateNoteLoading: false,
        createError: '',
      }
    )

    const createButton = getByRole('button', { name: 'Create' })
    await userEvent.click(createButton)
    const input = getByRole('textbox', { name: 'Note title' })
    expect(input).toBeDefined()

    // clicking the cancel button should remove the input
    const cancelButton = getByRole('button', { name: 'Cancel' })

    await userEvent.click(cancelButton)
    expect(queryByRole('textbox', { name: 'Note title' })).toBeNull()

    // user can enter note, and submit event is called with title
    createButton.click()
    await userEvent.type(input, 'My new note')

    // TODO: emits the event when save button clicked
  })
})
