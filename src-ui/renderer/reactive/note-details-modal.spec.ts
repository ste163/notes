import { vi, describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { renderNoteDetailsModal } from './note-details-modal'
import { NoteEvents, createEvent } from 'event'
import type { Note } from 'types'

vi.mock('event')

const createdAt = new Date()
// Ensure 'updatedAt' is later than 'createdAt' by adding time
const updatedAt = new Date(createdAt.getTime() + 1000 * 60 * 60) // adds one hour

const note: Note = {
  _id: 'note-id',
  _rev: 'rev-id',
  title: 'Note title',
  createdAt,
  updatedAt,
  content: 'Note content',
}

// TODO (after refactoring, add the feature):
// clicking the DELETE opens an input that requires you to type confirm
// and only if that is inputted, can you click the confirm button (becomes enabled)
describe('note-details-modal', () => {
  it('renders details modal with note state and can emit delete event on delete', async () => {
    const { getByRole, getByText } = renderComponent({
      renderComponent: renderNoteDetailsModal,
      props: note,
    })

    // note title renders in input
    expect(getByRole('textbox', { name: 'Edit note title' })).toHaveValue(
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
    await userEvent.click(getByRole('button', { name: 'Delete' }))
    expect(createEvent).toHaveBeenCalledWith(NoteEvents.Delete, { note })
  })

  it.todo(
    'renders detail modal and updating title emits update event'
    // TODO:
    // rewrite modal to always have the input rendered with the title and allow updating it
    // the UPDATE button needs to be disabled if: note title is the same or empty
    // there will not be a cancel button, just the modal's close button
  )
})
