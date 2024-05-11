import { vi, describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { noteDetailsDialog } from './note-details-dialog'
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

// TODO
// clicking the DELETE opens an input that requires you to type confirm
// and only if that is inputted, can you click the confirm button (becomes enabled)
describe('note-details-dialog', () => {
  it('renders details dialog with note state and can emit delete event on delete', async () => {
    const { getByRole, getByText } = renderComponent({
      renderComponent: noteDetailsDialog.render.bind(noteDetailsDialog),
      props: note,
    })

    // note title renders in input
    expect(getByRole('textbox', { name: 'Update note title' })).toHaveValue(
      note.title
    )

    // created at is rendered
    expect(
      getByText(new Date(note.createdAt).toLocaleString())
    ).toBeInTheDocument()

    // last updated at is rendered
    expect(
      getByText(new Date(note.updatedAt).toLocaleString())
    ).toBeInTheDocument()

    // delete button is rendered
    await userEvent.click(getByRole('button', { name: 'Delete Delete' }))
    expect(createEvent).toHaveBeenCalledWith(NoteEvents.Delete, { note })
  })

  it('title input is disabled unless changed, and can emit update event', async () => {
    const newTitle = 'New title!'

    const { getByRole } = renderComponent({
      renderComponent: noteDetailsDialog.render.bind(noteDetailsDialog),
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
    expect(createEvent).toHaveBeenCalledWith(NoteEvents.EditTitle, {
      note: { ...note, title: newTitle },
    })
  })
})
