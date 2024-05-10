import { NoteEvents, createEvent } from 'event'
import { instantiateButton, instantiateInput, renderDialog } from 'components'
import { deleteIcon } from 'icons'
import type { Note } from 'types'
import './note-details-dialog.css'

// TODO:
// - add delete confirmation input (type note title to confirm delete)

function renderNoteDetailsDialog(note: Note) {
  const { createdAt, updatedAt } = note
  const dialogContent = document.createElement('div')

  // setup dialog structure
  dialogContent.innerHTML = `
    <div class='note-details-container'>
      <h3>Title</h3>
      <div id="title-edit"></div>
      <h3>Created at</h3>
      <div>${new Date(createdAt).toLocaleString()}</div>
      <h3>Last updated at</h3>
      <div>${new Date(updatedAt).toLocaleString()}</div>
    </div>`

  // add delete button
  dialogContent.appendChild(
    instantiateButton({
      title: 'Delete note',
      html: `  
        ${deleteIcon}
        <span>Delete</span>`,
      onClick: () => createEvent(NoteEvents.Delete, { note }).dispatch(),
      style: {
        marginTop: '1em',
      },
    })
  )

  renderDialog({
    title: 'Details',
    content: dialogContent,
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
  const inputAndButtonContainer = document.createElement('div')
  const buttonContainer = document.createElement('div')
  buttonContainer.style.display = 'flex'
  buttonContainer.style.marginTop = '0.5em'

  const { inputContainer, button } = instantiateInputAndButton(note)

  buttonContainer.appendChild(button)
  inputAndButtonContainer.appendChild(inputContainer)
  inputAndButtonContainer.appendChild(buttonContainer)
  titleEditContainer.appendChild(inputAndButtonContainer)
}

/**
 * Instantiate input and button, and sets up
 * event listeners to track input value and disabled states
 *
 * @param note Note
 */
function instantiateInputAndButton(note: Note) {
  let inputValue = note.title

  const { input, inputContainer } = instantiateInput({
    id: 'update-title',
    title: 'Update note title',
    placeholder: 'Note title',
    value: inputValue,
  })

  const button = instantiateButton({
    title: 'Update title',
    html: 'Update',
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

  return { inputContainer, button }
}

export { renderNoteDetailsDialog }
