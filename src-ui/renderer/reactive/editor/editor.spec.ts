import { vi, describe, expect, it } from 'vitest'
import { renderComponent } from 'test-utils'
import userEvent from '@testing-library/user-event'
import { NoteEvents, createEvent } from 'event'
import { editor } from './editor'
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
    const { getByRole, getAllByRole, queryByRole } = renderComponent(
      editor.render.bind(editor)
    )
    editor.setNote(note)

    // open input
    await userEvent.click(getByRole('button', { name: 'Note title' }))

    // the button is now gone and the input renders
    expect(queryByRole('button', { name: 'Note title' })).toBeNull()
    expect(getByRole('textbox')).toHaveValue(note.title)

    // remove focus from the text input
    await userEvent.click(getAllByRole('button', { name: 'Bold' })[0])

    // the input is now gone and the button renders
    expect(queryByRole('textbox')).toBeNull()
    expect(getByRole('button', { name: 'Note title' })).toHaveTextContent(
      note.title
    )
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('if the title was set to an empty string, then the original title renders', async () => {
    const { getByRole, getAllByRole, queryByRole } = renderComponent(
      editor.render.bind(editor)
    )
    editor.setNote(note)

    // open input
    await userEvent.click(getByRole('button', { name: 'Note title' }))

    const input = getByRole('textbox')
    await userEvent.clear(input)

    // remove focus from the text input
    await userEvent.click(getAllByRole('button', { name: 'Bold' })[0])

    // the input is now gone and the button renders
    expect(queryByRole('textbox')).toBeNull()
    expect(getByRole('button', { name: 'Note title' })).toHaveTextContent(
      note.title
    )
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('if the title was changed, then calls the update title event', async () => {
    const { getByRole, getAllByRole } = renderComponent(
      editor.render.bind(editor)
    )
    editor.setNote(note)

    // open input
    await userEvent.click(getByRole('button', { name: 'Note title' }))

    const input = getByRole('textbox')
    await userEvent.clear(input) // remove old title
    await userEvent.type(input, 'New title!')

    // remove focus from the text input
    await userEvent.click(getAllByRole('button', { name: 'Bold' })[0])

    expect(createEvent).toHaveBeenCalledWith(NoteEvents.UpdateTitle, {
      title: 'New title!',
    })
  })
})
