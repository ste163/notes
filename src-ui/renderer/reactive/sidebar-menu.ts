import { NoteEvents, createEvent } from 'event'
import { renderButton } from 'components'
import './sidebar-menu.css'

interface Props {
  noteTitle?: string
  isCreatingNote: boolean
  createError?: string
}

/**
 * Render create note button and input
 */
function renderSidebarMenu({
  noteTitle,
  isCreatingNote,
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
          isCreatingNote,
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

  if (isCreatingNote) {
    // then the user has interacted with note input, so ensure it renders
    renderCreateNoteInput({
      container,
      isCreatingNote,
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
  isCreatingNote,
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
        <input class="note-input" title="Input note title" placeholder="Note title" />
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

  if (isCreatingNote) {
    saveNoteButton.disabled = isCreatingNote
  }

  if (createError) {
    // todo: error rendering if creation fails
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

export { renderSidebarMenu }
