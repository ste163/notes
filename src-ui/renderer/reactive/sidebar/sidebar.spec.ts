import { vi, describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { sidebar } from './sidebar'
import { NoteEvents, createEvent } from 'event'
import type { Notes } from 'types'

vi.mock('event')

describe('sidebar', () => {
  it('renders base input that can cancel and submit a note, if not loading and no error', async () => {
    const title = 'Note title'

    const { getByRole, queryByRole } = renderComponent({
      renderComponent: sidebar.render.bind(sidebar),
    })

    // renders input on create click
    const createButton = getByRole('button', { name: 'Add Create' })
    await userEvent.click(createButton)
    const input = getByRole('textbox', { name: 'Note title' })

    // clicking cancel button removes input
    const cancelButton = getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)
    expect(queryByRole('textbox', { name: 'Note title' })).toBeNull()

    // can enter note and submit event is called with title
    createButton.click()

    // TODO:
    // - SAVE is disabled if no title entered
    // - the create event was called with the TRIMMED title

    await userEvent.type(input, title)
    await userEvent.click(getByRole('button', { name: 'Save' }))
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(NoteEvents.Create, {
      title,
    })
  })

  it('renders no notes if no notes are present', () => {
    const { getAllByRole } = renderComponent({
      renderComponent: sidebar.render.bind(sidebar),
    })
    sidebar.renderNoteList()

    // notes are rendered as buttons, but the first two are the create and close buttons
    expect(getAllByRole('button')).toHaveLength(2)
  })

  it('renders note list and clicking note emits event', async () => {
    const notes: Notes = {
      '1': {
        _id: '1',
        title: 'Note 1',
        updatedAt: new Date(),
        createdAt: new Date(),
        content: '',
      },
      '2': {
        _id: '2',
        title: 'Note 2',
        updatedAt: new Date(),
        createdAt: new Date(),
        content: '',
      },
    }
    const { getAllByRole } = renderComponent({
      renderComponent: sidebar.render.bind(sidebar),
    })
    sidebar.renderNoteList(notes)

    // notes are rendered as buttons
    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(Object.keys(notes).length + 2) // first two buttons are create and close

    // clicking note emits event
    await userEvent.click(buttons[2]) // click the first note
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(NoteEvents.Select, {
      _id: '1',
    })
  })

  it('renders active note as disabled', () => {
    const activeNoteId = 'abc'

    const notes: Notes = {
      [activeNoteId]: {
        _id: activeNoteId,
        title: 'Note 1',
        updatedAt: new Date(),
        createdAt: new Date(),
        content: '',
      },
      '2': {
        _id: '2',
        title: 'Note 2',
        updatedAt: new Date(),
        createdAt: new Date(),
        content: '',
      },
    }

    const { getAllByRole } = renderComponent({
      renderComponent: sidebar.render.bind(sidebar),
    })
    // must call multiple methods because
    // we are not testing the accurate application flow
    sidebar.setNotes(notes)
    sidebar.setActiveNote(activeNoteId)
    sidebar.render()
    // active note is disabled
    const buttons = getAllByRole('button')
    expect(buttons[3]).toBeDisabled()
  })
})
