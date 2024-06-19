import {
  describe,
  // expect,
  it,
} from 'vitest'
// import { renderComponent } from 'test-utils'
// import userEvent from '@testing-library/user-event'
// import { NoteEvents, createEvent } from 'event'
// import { editor } from './editor'
// import type { Note } from 'types'

// const createdAt = new Date()
// Ensure 'updatedAt' is later than 'createdAt' by adding an hour
// const updatedAt = new Date(createdAt.getTime() + 1000 * 60 * 60)

describe('editor', () => {
  //   const note: Note = {
  //     _id: 'note-id',
  //     _rev: 'rev-id',
  //     title: 'Note title',
  //     createdAt,
  //     updatedAt,
  //     content: 'Note content',
  //   }

  it.skip('title input is disabled unless changed, and can emit update event', async () => {
    // const newTitle = 'New title!'
    // const { getByRole } = renderComponent({
    //   renderComponent: editor.render.bind(editor),
    // })
    // const titleInput = getByRole('textbox', { name: 'Update note title' })
    // const updateButton = getByRole('button', { name: 'Update' })
    // // update button is disabled if title is unchanged
    // expect(updateButton).toBeDisabled()
    // // if the title input is empty, update button is disabled
    // await userEvent.clear(titleInput)
    // expect(updateButton).toBeDisabled()
    // // if the title input is changed back to the initial title, update button is disabled
    // await userEvent.type(titleInput, note.title)
    // expect(updateButton).toBeDisabled()
    // // clearing and setting a new title enables update button
    // await userEvent.clear(titleInput)
    // await userEvent.type(titleInput, newTitle)
    // expect(updateButton).not.toBeDisabled()
    // // clicking update button emits update event
    // await userEvent.click(updateButton)
    // expect(createEvent).toHaveBeenCalledWith(NoteEvents.UpdateTitle, {
    //   title: newTitle,
    // })
  })
})
