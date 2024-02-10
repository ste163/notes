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
  const noteButtons = Object.values(notes)?.map(({ _id, title, updatedAt }) => {
    // for each note, setup the button and its container div
    const button = instantiateButton({
      id: _id,
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
    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('note-select-container')
    buttonContainer.id = `${_id}-${'note-select-container'}`
    buttonContainer.appendChild(button)
    return buttonContainer
  })
  // add each button to sidebar container
  noteButtons?.forEach((button) => container.appendChild(button))
}

export { renderSidebarNoteList }
