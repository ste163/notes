import { vi, describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { noteDeleteDialog } from './note-delete-dialog'
import { NoteEvents, createEvent } from 'event'
import type { Note } from 'types'

vi.mock('event')

const createdAt = new Date()
// Ensure 'updatedAt' is later than 'createdAt' by adding an hour
const updatedAt = new Date(createdAt.getTime() + 1000 * 60 * 60)

const note: Note = {
  _id: 'note-id',
  _rev: 'rev-id',
  title: 'Note title',
  createdAt,
  updatedAt,
  content: 'Note content',
}

describe('note-delete-dialog', () => {
  it('renders delete dialog emits delete event on delete', async () => {
    const { getByRole } = renderComponent({
      renderComponent: noteDeleteDialog.render.bind(noteDeleteDialog),
      props: note,
    })

    // note title renders in input
    expect(getByRole('textbox', { name: 'Update note title' })).toHaveValue(
      note.title
    )

    // delete button is rendered
    await userEvent.click(
      getByRole('button', { name: 'Delete Delete forever' })
    )
    expect(createEvent).toHaveBeenCalledWith(NoteEvents.Delete, { note })
  })

  // TODO: move to editor
  it('title input is disabled unless changed, and can emit update event', async () => {
    const newTitle = 'New title!'

    const { getByRole } = renderComponent({
      renderComponent: noteDeleteDialog.render.bind(noteDeleteDialog),
      props: note,
    })

    const titleInput = getByRole('textbox', { name: 'Update note title' })
    const updateButton = getByRole('button', { name: 'Update' })

    // update button is disabled if title is unchanged
    expect(updateButton).toBeDisabled()

    // if the title input is empty, update button is disabled
    await userEvent.clear(titleInput)
    expect(updateButton).toBeDisabled()

    // if the title input is changed back to the initial title, update button is disabled
    await userEvent.type(titleInput, note.title)
    expect(updateButton).toBeDisabled()

    // clearing and setting a new title enables update button
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, newTitle)
    expect(updateButton).not.toBeDisabled()

    // clicking update button emits update event
    await userEvent.click(updateButton)
    expect(createEvent).toHaveBeenCalledWith(NoteEvents.UpdateTitle, {
      title: newTitle,
    })
  })
})
