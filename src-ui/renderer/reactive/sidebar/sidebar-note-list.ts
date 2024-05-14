import { NoteEvents, createEvent } from 'event'
import { Button } from 'components'
import type { Notes } from 'types'
import './sidebar-note-list.css'

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
  const noteButtons = Object.values(notes)?.map(({ _id, title, updatedAt }) =>
    new Button({
      id: _id,
      title: 'Select note',
      onClick: () => createEvent(NoteEvents.Select, { _id }).dispatch(),
      html: `
      <div>
        <div>${title}</div>
        <div class="select-note-date">${new Date(
          updatedAt
        ).toLocaleString()}</div>
      </div>`,
    }).getElement()
  )
  noteButtons?.forEach((b) => {
    // setup container for button and append to sidebar
    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('note-select-container')
    buttonContainer.id = `${b.id}-${'note-select-container'}`
    buttonContainer.appendChild(b)
    container.appendChild(buttonContainer)
  })
}

export { renderSidebarNoteList }
