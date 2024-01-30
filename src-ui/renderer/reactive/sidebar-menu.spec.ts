import { describe, it, expect } from 'vitest'
import { Window } from 'happy-dom'
import { within } from '@testing-library/dom'
import { renderSidebarMenu } from './sidebar-menu'

// TODO: probably move this to a test-util
// so that I can have one place to manage all of the window state and types.
// can pass in component, props, an optional containerId, and then return the within function for full access
const renderComponent = (props?: {
  noteTitle?: string
  isCreateNoteLoading?: boolean
  createError?: string
}) => {
  const window = new Window()
  globalThis.window = window as Window & typeof globalThis.window
  globalThis.document = window.document as unknown as Document &
    typeof globalThis.document

  globalThis.window.document.body.innerHTML =
    '<div id="sidebar-top-menu"></div>'

  renderSidebarMenu({
    noteTitle: props?.noteTitle ?? '',
    isCreateNoteLoading: props?.isCreateNoteLoading ?? false,
    createError: props?.createError ?? '',
  })

  return within(window.document.body as unknown as HTMLElement)
}

describe('sidebar-menu', () => {
  it('throws error if container is not found', () => {
    try {
      renderSidebarMenu({
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

  it.todo('if error, render full input and the error')

  it.todo(
    'renders loading state if isCreateNoteLoading and no error'
    // ensure the save not button is disabled (and maybe also the cancel button?)
  )

  it('renders base input that can cancel and submit a note, if not loading and no error', async () => {
    const { getByRole, queryByRole } = renderComponent()

    const createButton = getByRole('button', { name: 'Create' })
    createButton.click()
    const input = getByRole('textbox', { name: 'Note title' })
    expect(input).toBeDefined()
    // clicking the cancel button should remove the input
    const cancelButton = getByRole('button', { name: 'Cancel' })
    // TODO: if I can actually do the entire user interact this way,
    // then remove userEvent to remove dependencies
    cancelButton.click()
    expect(queryByRole('textbox', { name: 'Note title' })).toBeNull()

    // TODO: emits the event when save button clicked
  })
})
