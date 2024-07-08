import { LifeCycleEvents, NoteEvents, createEvent } from 'event'
import { Button, Input } from 'components'
import { addNoteIcon, closeIcon } from 'icons'
import type { Notes } from 'types'
import './sidebar.css'

class Sidebar {
  private notes: Notes = {}
  private activeNoteId: string = ''
  private inputContainerId = 'note-input-container'

  constructor() {
    this.renderInput = this.renderInput.bind(this)
    this.renderNoteList = this.renderNoteList.bind(this)
  }

  public render() {
    const container = document.querySelector('#sidebar')
    if (!container) throw new Error('Sidebar container not found')
    container.classList.remove('sidebar-closed')
    container.classList.add('sidebar-opened')
    container.innerHTML = '' // reset container
    container.innerHTML = `
      <div id='sidebar-menu'>
        <div id='sidebar-menu-controls'></div>
      </div>
      <div id='sidebar-list'></div>`

    document.querySelector('#sidebar-menu-controls')?.appendChild(
      new Button({
        testId: 'create-note',
        title: 'Create note',
        onClick: this.renderInput,
        html: `
          ${addNoteIcon}
          <span>Create<span/>`,
      }).getElement()
    )

    document.querySelector('#sidebar-menu-controls')?.appendChild(
      new Button({
        testId: 'close-sidebar',
        id: 'close-sidebar',
        title: 'Close sidebar',
        onClick: this.emitClose.bind(this),
        html: `${closeIcon}`,
        style: { border: 'none' },
      }).getElement()
    )

    this.renderNoteList(this.notes)
    this.setActiveNoteInList()
  }

  public renderNoteList(notes: Notes = {}) {
    this.setNotes(notes)
    const container = document.querySelector('#sidebar-list')
    if (!container) return
    container.innerHTML = '' // reset container before rendering

    const noteButtons = Object.values(notes)?.map(
      ({ _id, title, updatedAt, createdAt }) =>
        new Button({
          id: _id,
          testId: 'note-select',
          title: 'Select note',
          onClick: () =>
            createEvent(LifeCycleEvents.QueryParamUpdate, {
              noteId: _id,
            }).dispatch(),
          html: `
        <div>
          <div>${title}</div>
          <div class="select-note-date">Updated: ${new Date(
            updatedAt
          ).toLocaleString()}</div>
          <div class="select-note-date">Created: ${new Date(
            createdAt
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

  public setNotes(notes: Notes) {
    this.notes = notes
  }

  public setActiveNote(id: string) {
    this.activeNoteId = id
    this.setActiveNoteInList()
  }

  public close() {
    const container = document.querySelector('#sidebar')
    if (!container) throw new Error('Sidebar container not found')
    container.classList.remove('sidebar-opened')
    container.classList.add('sidebar-closed')
    container.innerHTML = '' // reset container
  }

  public open() {
    this.render()
  }

  public closeInput() {
    const container = document.querySelector(`#${this.inputContainerId}`)
    container?.remove()
  }

  public toggleFullscreen(isFullscreen: boolean) {
    const container = document.querySelector('#sidebar')
    isFullscreen
      ? container?.classList.add('sidebar-fullscreen')
      : container?.classList.remove('sidebar-fullscreen')
  }

  private emitClose() {
    createEvent(LifeCycleEvents.QueryParamUpdate, {
      sidebar: 'close',
    }).dispatch()
  }

  private setActiveNoteInList() {
    if (!this.activeNoteId) return // no active note selected, ignore

    const setStyling = () => {
      const activeClass = 'select-note-active'
      document.querySelectorAll(`.${activeClass}`)?.forEach((element) => {
        element?.classList?.remove(activeClass)
      })
      document
        .querySelector(`#${this.activeNoteId}-note-select-container`)
        ?.classList.add(activeClass)
    }

    const setDisabledState = () => {
      document
        .querySelectorAll('.note-select-container')
        .forEach((container) => {
          const button = container.querySelector('button')
          if (button) {
            button.disabled = false
          }
        })

      const selectedButton = document.querySelector(
        `#${this.activeNoteId}`
      ) as HTMLButtonElement
      if (selectedButton) selectedButton.disabled = true
    }

    setStyling()
    setDisabledState()
  }

  private renderInput() {
    // reset container before rendering (in case already rendered)
    this.closeInput()
    const { saveButton, cancelButton, inputContainer, input } =
      this.instantiateInputElements()

    saveButton.disabled = true // disable by default as there is no value entered

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

    input.addEventListener('input', (event) => {
      const value = (event.target as HTMLInputElement).value
      saveButton.disabled = value.trim() === ''
    })

    // accessibility focus
    input?.focus()
  }

  private instantiateInputElements() {
    const inputInstance = new Input({
      testId: 'create-note-input',
      id: 'create-note',
      label: 'Note title',
      placeholder: 'Note title',
    })
    const input = inputInstance.getInput()
    return {
      input,
      inputContainer: inputInstance.getContainer(),
      saveButton: new Button({
        testId: 'create-note-save',
        title: 'Save note',
        html: 'Save',
        onClick: () => {
          const title: string = input?.value.trim()
          if (!title) throw new Error('Unable to read title from input')
          createEvent(NoteEvents.Create, { title }).dispatch()
        },
      }).getElement(),
      cancelButton: new Button({
        testId: 'create-note-cancel',
        title: 'Cancel',
        html: 'Cancel',
        onClick: this.closeInput.bind(this),
      }).getElement(),
    }
  }
}

const sidebar = new Sidebar()

export { sidebar }
