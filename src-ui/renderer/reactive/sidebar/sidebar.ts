import { NoteEvents, createEvent } from 'event'
import { Button } from 'components'
import type { Notes } from 'types'
import './sidebar.css'

class Sidebar {
  public render() {
    // render the basic sidebar setup
    const container = document.querySelector('#sidebar')
    if (!container) throw new Error('Sidebar container not found')
    container.innerHTML = '' // reset container
    container.innerHTML = `
      <div id='sidebar-top-menu'></div>
      <div id='sidebar-list'></div>
    `
  }

  public renderNoteList({
    isLoading,
    notes,
  }: {
    isLoading: boolean
    notes: Notes
  }) {
    const container = document.querySelector('#sidebar-list') as Element
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
}

const sidebar = new Sidebar()

export { sidebar }
