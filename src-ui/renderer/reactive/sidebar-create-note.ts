import { NoteEvents, createEvent } from 'event'
import { renderButton } from 'components'
import './sidebar-create-note.css'

interface Props {
  noteTitle?: string
  isCreateNoteLoading: boolean
  createError?: string
}

// TODO: testing
// it.todo('if not loading and no error, render base input')
// it.todo('if error, render full input and error')
// it.todo('if isCreateNoteLoading and no error, renders loading spinner on create button + disabled')
// it.todo('emits create event with title on save button click')

/**
 * Render create note button and input
 * inside the sidebar. Note: could pass in
 * the container to allow for reusing the component
 */
function renderSidebarCreateNote({
  noteTitle,
  isCreateNoteLoading,
  createError,
}: Props): void {
  const container = document.querySelector('#sidebar-top-menu')
  if (!container) throw new Error('Unable to find sidebar-top-menu container')
  container.innerHTML = '' // reset container before rendering
  container.appendChild(
    renderButton({
      title: 'Create note',
      onClick: () =>
        renderCreateNoteInput({
          container,
          isCreateNoteLoading,
          noteTitle,
          createError,
        }),
      html: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <title>Create note</title>
          <path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 11V8H13V11H16V13H13V16H11V13H8V11H11Z"></path>
        </svg>
        <span>Create<span/>
      `,
    })
  )

  if (isCreateNoteLoading || createError) {
    // then the user has interacted with note input, so ensure it renders
    renderCreateNoteInput({
      container,
      isCreateNoteLoading,
      noteTitle,
      createError,
    })
  }
}

interface InputProps extends Props {
  container: Element
}

function renderCreateNoteInput({
  container,
  isCreateNoteLoading,
  noteTitle,
  createError,
}: InputProps) {
  const inputContainerClass = 'create-note-input-container'
  const checkForAlreadyRenderedInput = () => {
    const isInputAlreadyRendered = document.querySelector(
      `.${inputContainerClass}`
    )
    if (isInputAlreadyRendered) {
      isInputAlreadyRendered.remove()
      return
    }
  }
  checkForAlreadyRenderedInput()
  const input = `
      <div class="${inputContainerClass}">
        <input class="note-input" title="Note title" placeholder="Note title" />
      </div>
    `
  container.insertAdjacentHTML('beforeend', input)
  const inputContainer = document.querySelector(`.${inputContainerClass}`)
  const noteInputClass = 'note-input'

  const buttonContainer = document.createElement('div')
  buttonContainer.className = 'note-input-buttons'

  inputContainer?.appendChild(buttonContainer)

  // in case there is an error, ensure the input value re-renders
  if (noteTitle) {
    const inputElement = document.querySelector(`.${noteInputClass}`)
    inputElement?.setAttribute('value', noteTitle)
  }

  const saveNoteButton = renderButton({
    title: 'Save note',
    html: 'Save',
    onClick: () => {
      const input = document.querySelector(
        `.${noteInputClass}`
      ) as HTMLInputElement
      const title: string = input?.value
      if (!title) throw new Error('Unable to read title from input')
      createEvent(NoteEvents.Create, { title }).dispatch()
    },
  })

  if (isCreateNoteLoading) {
    saveNoteButton.disabled = isCreateNoteLoading
  }

  if (createError) {
    // TODO: error rendering if creation fails
    console.error('HAVE NOT SETUP CREATE ERROR RENDERING')
  }
  // add the create button to the input container
  buttonContainer?.appendChild(saveNoteButton)
  buttonContainer?.appendChild(
    renderButton({
      title: 'Cancel creating',
      html: 'Cancel',
      onClick: checkForAlreadyRenderedInput,
    })
  )

  const inputElement = document.querySelector(
    `.${noteInputClass}`
  ) as HTMLElement

  inputElement?.focus()
}

export { renderSidebarCreateNote }
