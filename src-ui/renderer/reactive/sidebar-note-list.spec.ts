import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { renderSidebarNoteList } from './sidebar-note-list'
import { NoteEvents, createEvent } from 'event'
import type { Notes } from 'types'

vi.mock('event')

describe('sidebar-note-list', () => {
  it('throws error if unable to find container', () => {
    try {
      renderComponent('', renderSidebarNoteList, {
        isLoading: false,
        notes: {},
      })
    } catch (error) {
      expect((error as Error).message).toBe(
        'Unable to find sidebar-list container'
      )
    }
  })

  it('renders loading while loading', () => {
    const { getByText } = renderComponent(
      'sidebar-list',
      renderSidebarNoteList,
      {
        isLoading: true,
        notes: {},
      }
    )

    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('renders no notes if no notes are present', () => {
    const { queryByRole } = renderComponent(
      'sidebar-list',
      renderSidebarNoteList,
      {
        isLoading: false,
        notes: {},
      }
    )
    // notes are rendered as buttons
    expect(queryByRole('button')).toBeNull()
  })

  it('renders notes and clicking note emits event', async () => {
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
    const { getAllByRole } = renderComponent(
      'sidebar-list',
      renderSidebarNoteList,
      {
        isLoading: false,
        notes,
      }
    )

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
