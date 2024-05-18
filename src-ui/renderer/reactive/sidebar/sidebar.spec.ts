import { describe, it, expect, vi } from 'vitest'
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
      renderComponent: sidebar.render,
    })

    sidebar.renderCreateNote({ title: '', error: '' })

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
    await userEvent.type(input, title)
    await userEvent.click(getByRole('button', { name: 'Save' }))
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(NoteEvents.Create, {
      title,
    })
  })

  it('note-list: renders loading while loading', () => {
    const { getByText } = renderComponent({
      renderComponent: sidebar.render,
    })
    sidebar.renderNoteList({ isLoading: true, notes: {} })

    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('note-list: renders no notes if no notes are present', () => {
    const { queryByRole } = renderComponent({
      renderComponent: sidebar.render,
    })
    sidebar.renderNoteList({ isLoading: false, notes: {} })

    // notes are rendered as buttons
    expect(queryByRole('button')).toBeNull()
  })

  it('note-list: renders notes and clicking note emits event', async () => {
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
      renderComponent: sidebar.render,
    })
    sidebar.renderNoteList({ isLoading: false, notes })

    // notes are rendered as buttons
    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(Object.keys(notes).length)

    // clicking note emits event
    await userEvent.click(buttons[0])
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(NoteEvents.Select, {
      _id: '1',
    })
  })
})
