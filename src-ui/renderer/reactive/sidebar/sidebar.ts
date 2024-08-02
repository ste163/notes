import { DIALOGS } from 'const'
import { LifeCycleEvents, NoteEvents, createEvent } from 'event'
import { Button, Input } from 'components'
import { addNoteIcon, closeIcon } from 'icons'
import { useLocalStorage } from 'use-local-storage'
import type { Notes } from 'types'
import './sidebar.css'

class Sidebar {
  private notes: Notes = {}
  private activeNoteId: string = ''
  private inputContainerId = 'note-input-container'
  private isFullscreen = false
  private resizeTimer: NodeJS.Timeout | null = null

  constructor() {
    this.renderInput = this.renderInput.bind(this)
    this.renderNoteList = this.renderNoteList.bind(this)
  }

  public render() {
    const container = document.querySelector('#sidebar') as HTMLDivElement
    if (!container) throw new Error('Sidebar container not found')
    container.classList.remove('sidebar-closed')
    container.classList.add('sidebar-opened')
    container.innerHTML = '' // reset container
    container.innerHTML = `
      <div class='sidebar-main'>
        <div id='sidebar-menu'>
          <div id='sidebar-menu-controls'></div>
        </div>
        <div id='sidebar-list'></div>
      </div>
      <div id='sidebar-resizer-handle' data-testid='sidebar-resize-handle'>
        <div id='sidebar-resizer-bar'></div>
      </div>`

    document.querySelector('#sidebar-menu-controls')?.appendChild(
      new Button({
        testId: 'create-note',
        title: 'Create note',
        className: 'note-create-button',
        onClick: () =>
          document.querySelector(`#${this.inputContainerId}`)
            ? this.closeInput()
            : this.renderInput(),
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

    const setupResizer = () => {
      const element = document.querySelector('.sidebar-main') as HTMLDivElement

      const getClampedWidth = (newWidth: number) => {
        const screenWidth = window.innerWidth
        const minWidth = 230
        const maxWidth = screenWidth * 0.5
        return Math.max(minWidth, Math.min(newWidth, maxWidth))
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!element) return
        const newWidth = e.clientX - element.getBoundingClientRect().left
        const clampedWidth = getClampedWidth(newWidth)
        element.style.width = `${clampedWidth}px`

        if (this.resizeTimer) clearTimeout(this.resizeTimer)
        this.resizeTimer = setTimeout(() => {
          this.setNoteButtonResizeTextWidth(clampedWidth)
          // debouncing even a tiny amount greatly
          // improves performance because it cuts out
          // many extra event calls
        }, 5)
      }

      /**
       * Not explicitly cleaning up event listeners elsewhere
       * as whenever the user clicks they're added and removed
       * when they stop clicking. Testing proves this works as expected.
       * Leaving as is unless an issue arises.
       */
      function stopResizing() {
        // get the current width that the element is set to
        const currentWidth = element?.style.width
        useLocalStorage.set('sidebar-width', { width: parseInt(currentWidth) })

        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', stopResizing)
      }

      const resizer = document.querySelector(
        '#sidebar-resizer-handle'
      ) as HTMLDivElement

      resizer.addEventListener('mousedown', (e) => {
        e.preventDefault()
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', stopResizing)
      })

      const storedWidth = useLocalStorage.get('sidebar-width')?.width
      if (storedWidth) element.style.width = `${getClampedWidth(storedWidth)}px`
    }

    setupResizer()
    this.assignFullscreenClasses()
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
          <div class='note-button-text-resize'>${title}</div>
          <div class='select-note-date note-button-text-resize'>Updated: ${new Date(
            updatedAt
          ).toLocaleString()}</div>
          <div class='select-note-date note-button-text-resize'>Created: ${new Date(
            createdAt
          ).toLocaleString()}</div>
        </div>`,
        }).getElement()
    )

    const contextMenuHandler = (id: string, event: Event) => {
      event.preventDefault()
      createEvent(LifeCycleEvents.QueryParamUpdate, {
        dialog: DIALOGS.DELETE,
        noteId: id,
      })?.dispatch()
    }

    noteButtons?.forEach((b) => {
      // setup container for button and append to sidebar
      const buttonContainer = document.createElement('div')
      buttonContainer.classList.add('note-select-container')
      buttonContainer.id = `${b.id}-${'note-select-container'}`

      // Not explicitly cleaning up these listeners. If it becomes an issue
      // write a cleanup function

      // apply listeners for context menu and touchscreen long-press
      buttonContainer.addEventListener('contextmenu', (event) =>
        contextMenuHandler(b.id, event)
      )

      // Handle long press for touchscreens
      let pressTimer: NodeJS.Timeout
      buttonContainer.addEventListener('touchstart', (event) => {
        pressTimer = setTimeout(() => {
          event.preventDefault()
          contextMenuHandler(b.id, event), 2000
        })
      })

      const eventsToClear = ['touchend', 'touchmove', 'touchcancel']
      eventsToClear.forEach((e) =>
        buttonContainer.addEventListener(e, () => clearTimeout(pressTimer))
      )

      buttonContainer.appendChild(b)
      container.appendChild(buttonContainer)
    })

    // not clamping the width as only valid widths can be stored
    this.setNoteButtonResizeTextWidth(
      useLocalStorage.get('sidebar-width')?.width
    )
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

  public setFullScreen(isFullscreen: boolean) {
    this.isFullscreen = isFullscreen
    this.assignFullscreenClasses()
  }

  private setNoteButtonResizeTextWidth(width: number) {
    const elements = document.querySelectorAll('.note-button-text-resize')
    Array.from(elements).forEach(
      (el) => ((el as HTMLDivElement).style.maxWidth = `${width - 30}px`)
    )
  }

  private assignFullscreenClasses() {
    const styleMainContainer = () => {
      const element = document.querySelector('.sidebar-main')
      this.isFullscreen
        ? element?.classList.add('sidebar-fullscreen')
        : element?.classList.remove('sidebar-fullscreen')
    }

    const styleResizeHandle = () => {
      const resizeHandle = document.querySelector(
        '#sidebar-resizer-handle'
      ) as HTMLElement
      if (!resizeHandle) return
      this.isFullscreen
        ? (resizeHandle.style.display = 'none')
        : (resizeHandle.style.display = 'flex')
    }

    styleMainContainer()
    styleResizeHandle()
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

    setStyling()
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

export { Sidebar }
