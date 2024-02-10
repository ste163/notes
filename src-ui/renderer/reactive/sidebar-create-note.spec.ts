import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { renderSidebarCreateNote } from './sidebar-create-note'
import { NoteEvents, createEvent } from 'event'

vi.mock('event')

const title = 'Note title'
const containerId = 'sidebar-top-menu'

describe('create-note', () => {
  it('throws error if container is not found', () => {
    try {
      renderComponent('', renderSidebarCreateNote, {
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
    const { getByRole } = renderComponent(
      containerId,
      renderSidebarCreateNote,
      {
        title,
        isSavingNote: false,
        error: 'Error',
      }
    )

    // input renders with title
    expect(getByRole('textbox', { name: 'Note title' })).toHaveValue(title)

    // check that buttons are not disabled
    expect(getByRole('button', { name: 'Save' })).not.toBeDisabled()

    // TODO: the error message renders (once I get the error message setup)
  })

  it('renders loading state if loading is true and never the error', () => {
    const { getByRole } = renderComponent(
      containerId,
      renderSidebarCreateNote,
      {
        title,
        isSavingNote: true,
        error: 'Error',
      }
    )

    // input renders with title
    expect(getByRole('textbox', { name: 'Note title' })).toHaveValue(title)

    // check that buttons are disabled
    expect(getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('renders base input that can cancel and submit a note, if not loading and no error', async () => {
    const { getByRole, queryByRole } = renderComponent(
      containerId,
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
    await userEvent.type(input, title)
    await userEvent.click(getByRole('button', { name: 'Save' }))
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(NoteEvents.Create, {
      title,
    })
  })
})
