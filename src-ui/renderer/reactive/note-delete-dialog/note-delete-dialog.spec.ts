import { vi, describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { noteDeleteDialog } from './note-delete-dialog'
import { NoteEvents, createEvent } from 'event'
import type { Note } from 'types'

vi.mock('event')

const note: Note = {
  _id: 'note-id',
  _rev: 'rev-id',
  title: 'Note title',
  createdAt: new Date(),
  updatedAt: new Date(),
  content: 'Note content',
}

describe('note-delete-dialog', () => {
  it('renders delete dialog emits delete event on delete', async () => {
    const { getByRole } = renderComponent({
      renderComponent: noteDeleteDialog.render.bind(noteDeleteDialog),
      props: note,
    })
    await userEvent.click(
      getByRole('button', { name: 'Delete Delete forever' })
    )
    expect(createEvent).toHaveBeenCalledWith(NoteEvents.Delete, { note })
  })
})
