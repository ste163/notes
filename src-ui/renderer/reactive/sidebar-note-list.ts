import { NoteEvents, createEvent } from 'event'
import { instantiateButton } from 'components'
import './sidebar-note-list.css'
import type { Notes } from 'types'

/**
 * Renders list of notes in sidebar
 * and clicking them emits selected event
 *
 * @param isLoading boolean
 * @param notes Notes object
 * @returns void
 */
function renderSidebarNoteList({
  isLoading,
  notes,
}: {
  isLoading: boolean
  notes: Notes
}) {
  const container = document.querySelector('#sidebar-list')
  if (!container) throw new Error('Unable to find sidebar-list container')
  container.innerHTML = '' // reset container before rendering
  if (isLoading) {
    // TODO: skeleton screen
    container.innerHTML = 'Loading...'
    return
  }
  Object.values(notes)?.map(({ _id, title, updatedAt }) => {
    if (!title) throw new Error('Unable to read name from note')
    const selectableNoteButton = instantiateButton({
      title,
      html: `
      <div>
        <div>${title}</div>
        <div class="select-note-date">${new Date(
          updatedAt
        ).toLocaleString()}</div>
      </div>`,
      onClick: () => createEvent(NoteEvents.Select, { _id: _id }).dispatch(),
    })
    selectableNoteButton.id = _id
    const noteSelectContainer = document.createElement('div')
    const containerClass = 'note-select-container'
    noteSelectContainer.classList.add(containerClass)
    noteSelectContainer.id = `${_id}-${containerClass}`
    noteSelectContainer.appendChild(selectableNoteButton)
    container.append(noteSelectContainer)
  })
}

export { renderSidebarNoteList }
