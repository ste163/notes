import { NoteEvents, createEvent } from 'event'
import { instantiateButton, instantiateInput } from 'components'

interface Props {
  title?: string
  isSavingNote: boolean
  error?: string
}

interface InputProps extends Props {
  menuContainer: Element
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
          menuContainer: container,
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
      menuContainer: container,
      isSavingNote,
      title,
      error,
    })
}

function renderInput({
  menuContainer,
  isSavingNote,
  title,
  error,
}: InputProps) {
  const inputAndButtonContainerClass = 'create-note-input-container'
  // reset container before rendering (in case already rendered)
  document.querySelector(`.${inputAndButtonContainerClass}`)?.remove()

  const { saveButton, cancelButton, inputContainer, input } =
    instantiateInputAndButtons(title, inputAndButtonContainerClass)

  if (isSavingNote) {
    saveButton.disabled = isSavingNote
    cancelButton.disabled = isSavingNote
  }

  if (error) {
    // TODO: error rendering if creation fails
    console.error('HAVE NOT SETUP CREATE ERROR RENDERING')
  }

  // create containers, set styles, and add to DOM
  const inputAndButtonContainer = document.createElement('div')
  inputAndButtonContainer.classList.add(inputAndButtonContainerClass)
  inputAndButtonContainer.style.display = 'flex'
  inputAndButtonContainer.style.flexDirection = 'column'

  inputContainer.style.marginBottom = '0.5em'
  inputContainer.style.marginTop = '0.5em'

  const buttonContainer = document.createElement('div')
  buttonContainer.style.display = 'flex'
  buttonContainer.style.justifyContent = 'space-between'
  buttonContainer.classList.add('note-input-buttons')
  buttonContainer.appendChild(saveButton)
  buttonContainer.appendChild(cancelButton)

  inputAndButtonContainer.appendChild(inputContainer)
  inputAndButtonContainer.appendChild(buttonContainer)

  menuContainer.appendChild(inputAndButtonContainer)

  // accessibility focus
  input?.focus()
}

function instantiateInputAndButtons(
  title: string | undefined,
  containerClass: string
) {
  const { input, inputContainer } = instantiateInput({
    id: 'create-note',
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
    onClick: () => document.querySelector(`.${containerClass}`)?.remove(),
  })
  return { saveButton, cancelButton, inputContainer, input }
}

export { renderSidebarCreateNote }
