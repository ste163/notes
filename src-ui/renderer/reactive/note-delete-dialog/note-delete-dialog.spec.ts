import { vi, describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render } from 'test-utils'
import { NoteDeleteDialog } from './note-delete-dialog'
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

describe('NoteDeleteDialog', () => {
  it('renders delete dialog emits delete event on delete', async () => {
    const { instance, getByRole } = render(NoteDeleteDialog)
    instance.render(note)
    await userEvent.click(
      getByRole('button', { name: 'Delete Delete forever' })
    )
    expect(getByRole('dialog').innerHTML).toContain(note.title)
    expect(createEvent).toHaveBeenCalledWith(NoteEvents.Delete, { note })
  })
})
