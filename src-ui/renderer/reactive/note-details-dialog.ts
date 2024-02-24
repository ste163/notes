import { NoteEvents, createEvent } from 'event'
import { instantiateButton, instantiateInput, renderModal } from 'components'
import type { Note } from 'types'
import './note-details-dialog.css'

// TODO:
// - add in the disabled/loading state for when requests are in-flight (this will be used for both TITLE and DELETE)
// - add delete confirmation input (type note title to confirm delete)

// TO HANDLE THE DISABLING OF BUTTONS WHILE IN FLIGHT:
// I ran into too many issues trying to listen to events
// because events go up and not down. I cannot add a listener
// to the delete button to disable it when the delete event is called.
// So I either have to re-render the component with the delete state
// Or manually have an updateState function. However, I still need to
// have the latest note passed in so that everything can stay in-sync,
// at which point, I have to re-render the component anyway.
//
// SOLUTION: just re-render the component with latest note state
// and disable the buttons.
// Then when the request completes, re-render with enabled buttons
// and latest note state

function renderNoteDetailsDialog(note: Note) {
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
  renderTitleEdit(document.querySelector('#title-edit') as Element, note)
}

/**
 * Renders title input and save button into container
 *
 * @param container to place input
 * @param note Note
 */
function renderTitleEdit(titleEditContainer: Element, note: Note) {
  const parentContainer = document.createElement('div')
  const buttonContainer = document.createElement('div')
  buttonContainer.style.display = 'flex'
  buttonContainer.style.marginTop = '0.5em'

  const { input, button } = instantiateInputAndButton(note)

  buttonContainer.appendChild(button)
  parentContainer.appendChild(input)
  parentContainer.appendChild(buttonContainer)
  titleEditContainer.appendChild(parentContainer)
}

/**
 * Instantiate input and button, and sets up
 * event listeners to track input value and disabled states
 *
 * @param note Note
 */
function instantiateInputAndButton(note: Note) {
  let inputValue = note.title

  const input = instantiateInput({
    title: 'Edit note title',
    placeholder: 'Note title',
    value: inputValue,
  })

  const button = instantiateButton({
    title: 'Save title',
    html: 'Save',
    disabled: note.title === inputValue,
    style: {
      marginRight: '0.5em',
    },
    onClick: () => {
      if (!inputValue) throw new Error('Unable to read input value')
      const updatedNote = { ...note, title: inputValue }
      createEvent(NoteEvents.EditTitle, { note: updatedNote }).dispatch()
    },
  })

  // on input value change, update value and button disabled state
  input.addEventListener('input', (event) => {
    inputValue = (event.target as HTMLInputElement).value
    button.disabled = note.title === inputValue || !inputValue.trim()
  })

  return { input, button }
}

export { renderNoteDetailsDialog }
