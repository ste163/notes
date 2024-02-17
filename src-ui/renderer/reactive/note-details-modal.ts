import { NoteEvents, createEvent } from 'event'
import { instantiateButton, renderModal } from 'components'
import type { Note } from 'types'
import './note-details-modal.css'

// TODO:
// - disable the button if you remove the entire title or if the title is unchanged
// - add in the disabled/loading state for when requests are in-flight (this will be used for both TITLE and DELETE)

function renderNoteDetailsModal(note: Note) {
  const { createdAt, updatedAt } = note
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
        <span>Delete</span>`,
      onClick: () => createEvent(NoteEvents.Delete, { note }).dispatch(),
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
  renderTitleEdit(container, note)
}

/**
 * Renders title input and save button into container
 *
 * @param container to place input
 * @param note Note
 */
function renderTitleEdit(container: Element, note: Note) {
  const inputClass = 'edit-note-input'

  const inputAndButtonContainer = document.createElement('div')
  const buttonContainer = document.createElement('div')
  buttonContainer.style.display = 'flex'
  buttonContainer.style.marginTop = '0.5em'

  buttonContainer.appendChild(instantiateSaveButton(note, inputClass))
  inputAndButtonContainer.appendChild(instantiateInput(note.title, inputClass))
  inputAndButtonContainer.appendChild(buttonContainer)
  container.appendChild(inputAndButtonContainer)

  const inputElement = document.querySelector(`.${inputClass}`) as HTMLElement
  inputElement?.focus()
}

/**
 * Instantiates the input element and sets up event listener
 *
 * @param title Note title as input value
 * @param inputClass class name for input
 * @returns Input element
 */
function instantiateInput(title: string, inputClass: string) {
  const input = document.createElement('input')
  input.className = inputClass
  input.title = 'Edit note title'
  input.placeholder = 'Note title'
  input.value = title
  return input
}

/**
 * Instantiates save button and sets up event listeners
 * for the note input
 *
 * @param note Note
 * @param inputClass used for getting the note input on save
 * @returns Button
 */

// NOTE/TODO: inputClass will probably be removed
// because the event will be sending the input value to the button
// (potentially)
function instantiateSaveButton(note: Note, inputClass: string) {
  const button = instantiateButton({
    title: 'Save title',
    html: 'Save',
    // TODO: track disabled state for the button on every input change
    // so I'll need to setup a listener for the input and button
    onClick: () => {
      const input = document.querySelector(`.${inputClass}`) as HTMLInputElement
      const title: string = input?.value
      if (!title) throw new Error('Unable to read title from input')
      const updatedNote = { ...note, title }
      createEvent(NoteEvents.EditTitle, { note: updatedNote }).dispatch()
    },
    style: {
      marginRight: '0.5em',
    },
  })

  return button
}

export { renderNoteDetailsModal }
