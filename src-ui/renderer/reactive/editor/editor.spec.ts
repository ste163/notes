import { vi, describe, expect, it } from 'vitest'
import { render } from 'test-utils'
import userEvent from '@testing-library/user-event'
import { NoteEvents, createEvent } from 'event'
import { Editor } from './editor'
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

describe('editor', () => {
  it('if title was not changed, then the original title renders', async () => {
    const { instance, getByRole, queryByRole } = render(Editor)
    instance.setNote(note)

    // open input
    await userEvent.click(getByRole('button', { name: 'Note title' }))

    // the button is now gone and the input renders
    expect(queryByRole('button', { name: 'Note title' })).toBeNull()
    expect(getByRole('textbox', { name: 'Edit title' })).toHaveValue(note.title)

    // remove focus from the text input
    await userEvent.click(getByRole('button', { name: 'Bold' }))

    // the input is now gone and the button renders
    expect(queryByRole('textbox', { name: 'Edit title' })).toBeNull()
    expect(getByRole('button', { name: 'Note title' })).toHaveTextContent(
      note.title
    )
    expect(createEvent).not.toHaveBeenCalledWith([NoteEvents.UpdateTitle])
  })

  it('if the title was set to an empty string, then the original title renders', async () => {
    const { instance, getByRole, queryByRole } = render(Editor)
    instance.setNote(note)

    // open input
    await userEvent.click(getByRole('button', { name: 'Note title' }))
    const input = getByRole('textbox', { name: 'Edit title' })
    await userEvent.clear(input)

    // remove focus from the text input
    await userEvent.click(getByRole('button', { name: 'Bold' }))

    // the input is now gone and the button renders
    expect(queryByRole('textbox', { name: 'Edit title' })).toBeNull()
    expect(getByRole('button', { name: 'Note title' })).toHaveTextContent(
      note.title
    )
    expect(createEvent).not.toHaveBeenCalledWith([NoteEvents.UpdateTitle])
  })

  it('if the title was changed, then calls the update title event', async () => {
    const { instance, getByRole } = render(Editor)
    instance.setNote(note)

    // open input
    await userEvent.click(getByRole('button', { name: 'Note title' }))

    const input = getByRole('textbox', { name: 'Edit title' })
    await userEvent.clear(input) // remove old title
    await userEvent.type(input, 'New title!')

    // remove focus from the text input
    await userEvent.click(getByRole('button', { name: 'Bold' }))

    expect(createEvent).toHaveBeenCalledWith(NoteEvents.UpdateTitle, {
      title: 'New title!',
    })
  })
})
