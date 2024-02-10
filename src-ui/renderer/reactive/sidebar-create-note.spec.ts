import { describe, it, expect, vi } from 'vitest'
import { Window } from 'happy-dom'
import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { renderSidebarCreateNote } from './sidebar-create-note'
import * as event from 'event'

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

const TITLE = 'Note title'

describe('create-note', () => {
  it('throws error if container is not found', () => {
    // TODO: use the render abstraction once its done
    try {
      renderSidebarCreateNote({
        title: '',
        isSavingNote: false,
        error: '',
      })
    } catch (error) {
      expect((error as Error).message).toBe(
        'Unable to find sidebar-top-menu container'
      )
    }
  })

  it('if create error, render full input and the error', () => {
    const { getByRole } = renderComponent(renderSidebarCreateNote, {
      title: TITLE,
      isSavingNote: false,
      error: 'Error',
    })

    // input renders with title
    expect(getByRole('textbox', { name: 'Note title' })).toHaveValue(TITLE)

    // check that buttons are not disabled
    expect(getByRole('button', { name: 'Save' })).not.toBeDisabled()

    // TODO: the error message renders (once I get the error message setup)
  })

  it('renders loading state if loading is true and never the error', () => {
    const { getByRole } = renderComponent(renderSidebarCreateNote, {
      title: TITLE,
      isSavingNote: true,
      error: 'Error',
    })

    // input renders with title
    expect(getByRole('textbox', { name: 'Note title' })).toHaveValue(TITLE)

    // check that buttons are disabled
    expect(getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('renders base input that can cancel and submit a note, if not loading and no error', async () => {
    const eventSpy = vi.spyOn(event, 'createEvent')

    const { getByRole, queryByRole } = renderComponent(
      renderSidebarCreateNote,
      {
        title: '',
        isSavingNote: false,
        error: '',
      }
    )

    // renders input on create click
    const createButton = getByRole('button', { name: 'Create' })
    await userEvent.click(createButton)
    const input = getByRole('textbox', { name: 'Note title' })

    // clicking cancel button removes input
    const cancelButton = getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)
    expect(queryByRole('textbox', { name: 'Note title' })).toBeNull()

    // can enter note and submit event is called with title
    createButton.click()
    await userEvent.type(input, TITLE)
    await userEvent.click(getByRole('button', { name: 'Save' }))
    expect(eventSpy).toHaveBeenCalledWith(event.NoteEvents.Create, {
      title: TITLE,
    })
  })
})
