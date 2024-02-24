import { NoteEvents, createEvent } from 'event'
import { instantiateButton, instantiateInput } from 'components'
import './sidebar-create-note.css'

interface Props {
  title?: string
  isSavingNote: boolean
  error?: string
}

interface InputProps extends Props {
  parentContainer: Element
}

function renderSidebarCreateNote({ title, isSavingNote, error }: Props): void {
  const container = document.querySelector('#sidebar-top-menu')
  if (!container) throw new Error('Unable to find sidebar-top-menu container')
  container.innerHTML = '' // reset container before rendering
  // render Create button that will always be present in the menu
  container.appendChild(
    instantiateButton({
      title: 'Create note',
      onClick: () =>
        renderInput({
          parentContainer: container,
          isSavingNote,
          title,
          error,
        }),
      html: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <title>Add</title>
          <path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 11V8H13V11H16V13H13V16H11V13H8V11H11Z"></path>
        </svg>
        <span>Create<span/>
      `,
    })
  )

  if (isSavingNote || error)
    // then the user has interacted with note input, so ensure it renders
    renderInput({
      parentContainer: container,
      isSavingNote,
      title,
      error,
    })
}

function renderInput({
  parentContainer,
  isSavingNote,
  title,
  error,
}: InputProps) {
  const inputContainerClass = 'create-note-input-container'
  const buttonContainerClass = 'note-input-buttons'
  // reset input container before rendering
  document.querySelector(`.${inputContainerClass}`)?.remove()

  const childContainer = document.createElement('div')
  childContainer.classList.add(inputContainerClass)

  const inputContainer = document.createElement('div')
  inputContainer.classList.add(inputContainerClass)

  const buttonContainer = document.createElement('div')
  buttonContainer.classList.add(buttonContainerClass)

  childContainer.appendChild(inputContainer)
  childContainer.appendChild(buttonContainer)

  parentContainer.appendChild(childContainer)

  const input = instantiateInput({
    title: 'Note title',
    placeholder: 'Note title',
    value: title,
  })

  const saveButton = instantiateButton({
    title: 'Save note',
    html: 'Save',
    onClick: () => {
      const title: string = input?.value
      if (!title) throw new Error('Unable to read title from input')
      createEvent(NoteEvents.Create, { title }).dispatch()
    },
  })

  const cancelButton = instantiateButton({
    title: 'Cancel',
    html: 'Cancel',
    onClick: () => document.querySelector(`.${inputContainerClass}`)?.remove(),
  })

  if (isSavingNote) {
    saveButton.disabled = isSavingNote
    cancelButton.disabled = isSavingNote
  }

  if (error) {
    // TODO: error rendering if creation fails
    console.error('HAVE NOT SETUP CREATE ERROR RENDERING')
  }
  // add instantiated elements to DOM
  inputContainer.appendChild(input)
  buttonContainer.appendChild(saveButton)
  buttonContainer.appendChild(cancelButton)
  // accessibility focus
  input?.focus()
}

export { renderSidebarCreateNote }
