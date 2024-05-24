import { LifeCycleEvents, NoteEvents, createEvent } from 'event'
import { Button, Input } from 'components'
import { addNoteIcon, closeIcon, fileListIcon } from 'icons'
import type { Notes } from 'types'
import './sidebar.css'

class Sidebar {
  private notes: Notes = {}
  private inputContainerId = 'note-input-container'
  private isOpen: boolean = false

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
      <div id='sidebar-menu'>
        <div id='sidebar-menu-controls'></div>
      </div>
      <div id='sidebar-list'></div>
    `
    document.querySelector('#sidebar-menu-controls')?.appendChild(
      new Button({
        title: 'Create note',
        onClick: this.renderInput,
        html: `
        ${addNoteIcon}
        <span>Create<span/>
      `,
      }).getElement()
    )

    document.querySelector('#sidebar-menu-controls')?.appendChild(
      new Button({
        id: 'close-sidebar',
        title: 'Close sidebar',
        onClick: this.close.bind(this),
        html: `${closeIcon}`,
        style: { border: 'none' },
      }).getElement()
    )

    this.renderNoteList(this.notes)
  }

  public open() {
    this.render()
    this.isOpen = true
    dispatchEvent(new Event(LifeCycleEvents.SidebarOpened))
  }

  public getIsOpen() {
    return this.isOpen
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
        onClick: this.open.bind(this),
        html: `${fileListIcon}`,
        style: { border: 'none' },
      }).getElement()
    )
    this.isOpen = false
    dispatchEvent(new Event(LifeCycleEvents.SidebarClosed))
  }

  public renderNoteList(notes: Notes = {}) {
    this.notes = notes
    const container = document.querySelector('#sidebar-list')
    if (!container) return
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

  public toggleFullscreen(isFullscreen: boolean) {
    const container = document.querySelector('#sidebar')
    isFullscreen
      ? container?.classList.add('sidebar-fullscreen')
      : container?.classList.remove('sidebar-fullscreen')
  }

  public toggleCloseButtonVisibility(isVisible: boolean) {
    const closeButton = document.querySelector('#close-sidebar')
    isVisible
      ? closeButton?.classList.remove('sidebar-close-invisible')
      : closeButton?.classList.add('sidebar-close-invisible')
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
