import { NoteEvents, createEvent } from 'event'
import { instantiateButton, renderModal } from 'components'
import type { Note } from 'types'
import './note-details-modal.css'

const EDIT_NOTE_TITLE_CONTAINER = 'edit-note-title-container'

// TODO:
// remove the idea of the 'edit' and 'locked' states.
// always render the input but LOCK the 'update' button
// unless the title has changed and is not empty (similar to remote-db-setup modal)
// ONCE THAT WORKS
// - add in the disabled/loading state for when requests are in-flight (this will be used for both TITLE and DELETE)

function renderNoteDetailsModal(note: Note) {
  const { title, createdAt, updatedAt } = note
  const modalContent = document.createElement('div')

  // setup modal structure
  modalContent.innerHTML = `
    <div class='note-details-container'>
      <h3>Title</h3>
      <div id="title-edit"></div>
      <h3>Created at</h3>
      <div>${new Date(createdAt).toLocaleString()}</div>
      <h3>Last updated at</h3>
      <div>${new Date(updatedAt).toLocaleString()}</div>
    </div>`

  // add delete button
  modalContent.appendChild(
    instantiateButton({
      title: 'Delete note',
      html: `  
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>Delete note</title>
            <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM13.4142 13.9997L15.182 15.7675L13.7678 17.1817L12 15.4139L10.2322 17.1817L8.81802 15.7675L10.5858 13.9997L8.81802 12.232L10.2322 10.8178L12 12.5855L13.7678 10.8178L15.182 12.232L13.4142 13.9997ZM9 4V6H15V4H9Z"></path>
        </svg>
        <span>Delete forever</span>`,
      onClick: () => createEvent(NoteEvents.Delete, { note }).dispatch(), // TODO send note id or note data, whatever pouchDb needs
      style: {
        marginTop: '1em',
      },
    })
  )

  renderModal({
    title: 'Details',
    content: modalContent,
    url: 'details',
  })

  // setup title-edit section
  const container = document.querySelector('#title-edit')
  if (!container) throw new Error('Missing title edit container')
  renderTitleEdit(container, title, note)
}

function resetTitleEditContainer() {
  // remove any existing title edit container
  const titleEditContainer = document.querySelector(
    `#${EDIT_NOTE_TITLE_CONTAINER}`
  )
  titleEditContainer?.remove() // remove it from DOM as we will replace it with the input
  // create the fresh container
  const container = document.createElement('div')
  container.id = EDIT_NOTE_TITLE_CONTAINER
  return container
}

function renderTitleEdit(container: Element, title: string, note: Note) {
  const titleContainer = resetTitleEditContainer()
  titleContainer.style.display = 'flex'
  titleContainer.style.alignItems = 'center'

  const titleSpan = document.createElement('span')
  titleSpan.textContent = title

  titleContainer.appendChild(titleSpan)
  titleContainer.appendChild(
    instantiateButton({
      title: 'Edit note title',
      html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Edit note title</title>
        <path d="M15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89H6.41421L15.7279 9.57627ZM17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785L17.1421 8.16206ZM7.24264 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L7.24264 20.89Z"></path>
      </svg>`,
      onClick: () => {
        renderTitleInput(container, title, note)
      },
      style: {
        marginLeft: '0.5em',
      },
    })
  )

  container.append(titleContainer)
}

function renderTitleInput(container: Element, title: string, note: Note) {
  const titleContainer = resetTitleEditContainer()

  const inputClass = 'edit-note-input'
  const input = `
      <input class="${inputClass}" title="Edit note title" placeholder="Note title" value="${title}" />`

  titleContainer.innerHTML = input

  container.appendChild(titleContainer)

  const buttonContainer = document.createElement('div')

  buttonContainer.style.display = 'flex'
  buttonContainer.style.marginTop = '0.5em'

  buttonContainer.appendChild(
    instantiateButton({
      title: 'Save title',
      html: 'Save',
      onClick: () => {
        const input = document.querySelector(
          `.${inputClass}`
        ) as HTMLInputElement
        const title: string = input?.value
        if (!title) throw new Error('Unable to read title from input')
        const updatedNote = { ...note, title }
        createEvent(NoteEvents.EditTitle, { note: updatedNote }).dispatch()
      },
      style: {
        marginRight: '0.5em',
      },
    })
  )
  buttonContainer.appendChild(
    instantiateButton({
      title: 'Cancel title edit',
      html: 'Cancel',
      onClick: () => {
        renderTitleEdit(container, title, note)
      },
    })
  )

  titleContainer.appendChild(buttonContainer)
  const inputElement = document.querySelector(`.${inputClass}`) as HTMLElement
  inputElement?.focus()
}

export { renderNoteDetailsModal }
