import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { sidebar } from './sidebar'
import { NoteEvents, createEvent } from 'event'
import type { Notes } from 'types'

vi.mock('event')

describe('sidebar', () => {
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
