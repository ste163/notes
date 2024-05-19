import { NoteEvents, createEvent } from 'event'
import { Button, Input } from 'components'
import { addNoteIcon, fileListIcon } from 'icons'
import type { Notes } from 'types'
import './sidebar.css'

class Sidebar {
  private notes: Notes = {}
  private inputContainerId = 'note-input-container'

  // TODO: allow for sidebar to opened and closed
  // if it's closed, the create button becomes an icon button for the menu
  // ALSO try
  // swap the editor buttons and the note list sidebar
  // so that way opening and closing the sidebar
  // does not move the editor text content

  constructor() {
    this.renderInput = this.renderInput.bind(this)
    this.renderNoteList = this.renderNoteList.bind(this)
  }

  public render() {
    // render the basic sidebar setup
    const container = document.querySelector('#sidebar')
    if (!container) throw new Error('Sidebar container not found')
    container.classList.remove('sidebar-closed')
    container.classList.add('sidebar-opened')
    container.innerHTML = '' // reset container
    container.innerHTML = `
      <div id='sidebar-menu'></div>
      <div id='sidebar-list'></div>
    `
    document.querySelector('#sidebar-menu')?.appendChild(
      new Button({
        title: 'Create note',
        onClick: this.renderInput,
        html: `
        ${addNoteIcon}
        <span>Create<span/>
      `,
      }).getElement()
    )

    this.renderNoteList(this.notes)
  }

  public open() {
    this.render()
  }

  public close() {
    const container = document.querySelector('#sidebar')
    if (!container) throw new Error('Sidebar container not found')

    // TODO: render the note title at the top left

    container.classList.remove('sidebar-opened')
    container.classList.add('sidebar-closed')
    container.innerHTML = '' // reset container
    container.appendChild(
      new Button({
        title: 'Open sidebar',
        onClick: this.render.bind(this),
        html: `${fileListIcon}`,
      }).getElement()
    )
  }

  public renderNoteList(notes: Notes = {}) {
    this.notes = notes
    const container = document.querySelector('#sidebar-list') as Element
    container.innerHTML = '' // reset container before rendering

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

  public closeInput() {
    const container = document.querySelector(`#${this.inputContainerId}`)
    container?.remove()
    document.removeEventListener('keydown', this.handleEscape)
  }

  private handleEscape = (event: KeyboardEvent) => {
    // TODO: (revisit)
    // this does not take into account if a modal is opened
    // so it's possible we may want this to be moved to
    // the global index listener, but we'll leave it for now
    if (event.key === 'Escape') {
      this.closeInput()
    }
  }

  private renderInput() {
    // reset container before rendering (in case already rendered)
    this.closeInput()
    const { saveButton, cancelButton, inputContainer, input } =
      this.instantiateInputElements()

    // create containers, set styles, and add to DOM
    const inputAndButtonContainer = document.createElement('div')
    inputAndButtonContainer.id = this.inputContainerId

    const buttonContainer = document.createElement('div')

    buttonContainer.classList.add('note-input-buttons')
    buttonContainer.appendChild(saveButton)
    buttonContainer.appendChild(cancelButton)

    inputAndButtonContainer.appendChild(inputContainer)
    inputAndButtonContainer.appendChild(buttonContainer)

    document
      .querySelector('#sidebar-menu')
      ?.appendChild(inputAndButtonContainer)

    // accessibility focus
    input?.focus()
    document.addEventListener('keydown', this.handleEscape)
  }

  private instantiateInputElements() {
    const inputInstance = new Input({
      id: 'create-note',
      title: 'Note title',
      placeholder: 'Note title',
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
        onClick: this.closeInput.bind(this),
      }).getElement(),
    }
  }
}

const sidebar = new Sidebar()

export { sidebar }
