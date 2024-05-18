import { NoteEvents, createEvent } from 'event'
import { Button, Input } from 'components'
import { addNoteIcon } from 'icons'
import type { Notes } from 'types'
import './sidebar.css'

// TODO if the note create input is open, ESC press closes it

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

  // TODO: revisit how errors work
  // I think i'll gut that feature as error handling is all done
  // by the logger and its notification system
  // that will also make the code simpler

  public renderCreateNote(
    { title, error }: Props = { title: '', error: '' }
  ): void {
    // TODO: the create note button should be in the instantiation of render()
    // and then open input and close input become functions on here

    const container = document.querySelector('#sidebar-top-menu') as Element
    container.innerHTML = '' // reset container before rendering
    // render Create button that will always be present in the menu
    container.appendChild(
      new Button({
        title: 'Create note',
        onClick: () =>
          renderInput({
            menuContainer: container,
            title,
            error,
          }),
        html: `
        ${addNoteIcon}
        <span>Create<span/>
      `,
      }).getElement()
    )

    if (error)
      // then the user has interacted with note input, so ensure it renders
      renderInput({
        menuContainer: container,
        title,
        error,
      })
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

interface Props {
  title?: string
  error?: string
}

interface InputProps extends Props {
  menuContainer: Element
}

function renderInput({ menuContainer, title, error }: InputProps) {
  const inputAndButtonContainerId = 'create-note-input-container'
  // reset container before rendering (in case already rendered)
  document.querySelector(`#${inputAndButtonContainerId}`)?.remove()

  const { saveButton, cancelButton, inputContainer, input } =
    instantiateElements(title, inputAndButtonContainerId)

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

function instantiateElements(
  title: string | undefined,
  containerToRemoveId: string
) {
  const inputInstance = new Input({
    id: 'create-note',
    title: 'Note title',
    placeholder: 'Note title',
    value: title,
  })
  const input = inputInstance.getInput()

  return {
    input,
    inputContainer: inputInstance.getContainer(),
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
  }
}

const sidebar = new Sidebar()

export { sidebar }
