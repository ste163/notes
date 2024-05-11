import { NoteEvents, createEvent } from 'event'
import { Button, instantiateInput } from 'components'
import { addNoteIcon } from 'icons'

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
    new Button({
      title: 'Create note',
      onClick: () =>
        renderInput({
          menuContainer: container,
          isSavingNote,
          title,
          error,
        }),
      html: `
      ${addNoteIcon}
      <span>Create<span/>
    `,
    }).getElement()
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
  const inputAndButtonContainerId = 'create-note-input-container'
  // reset container before rendering (in case already rendered)
  document.querySelector(`#${inputAndButtonContainerId}`)?.remove()

  const { saveButton, cancelButton, inputContainer, input } =
    instantiateInputAndButtons(title, inputAndButtonContainerId)

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
  inputAndButtonContainer.id = inputAndButtonContainerId
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
  containerToRemoveId: string
) {
  const { input, inputContainer } = instantiateInput({
    id: 'create-note',
    title: 'Note title',
    placeholder: 'Note title',
    value: title,
  })

  return {
    saveButton: new Button({
      title: 'Save note',
      html: 'Save',
      onClick: () => {
        const title: string = input?.value
        if (!title) throw new Error('Unable to read title from input')
        createEvent(NoteEvents.Create, { title }).dispatch()
      },
    }).getElement(),
    cancelButton: new Button({
      title: 'Cancel',
      html: 'Cancel',
      onClick: () =>
        document.querySelector(`#${containerToRemoveId}`)?.remove(),
    }).getElement(),
    inputContainer,
    input,
  }
}

export { renderSidebarCreateNote }
