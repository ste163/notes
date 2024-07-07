import { Button, Loader } from 'components'
import {
  databaseIcon,
  deleteIcon,
  errorIcon,
  fileListIcon,
  saveIcon,
} from 'icons'
import { createEvent, LifeCycleEvents, NoteEvents } from 'event'
import pkg from '../../../../package.json'
import type { Note } from 'types'
import './status-bar.css'

class StatusBar {
  public render() {
    const container = document.querySelector('#status-bar')
    if (!container) throw new Error('Status bar container not found')
    container.innerHTML = '' // reset container
    container.innerHTML = `
      <div class='status-bar-left-container'>
        <div id='sidebar-container'></div>
        <div id='remote-db-setup-container'></div>
        <div id='status-bar-synced-on' class='status-bar-date status-bar-hide-on-mobile'></div>
      </div>
      <div class='status-bar-right-container'>
        <div id='status-bar-saved-on' class='status-bar-date status-bar-hide-on-mobile'></div>
        <div id='status-bar-alert'></div>
        <div id='status-bar-save'></div>
        <div id='status-bar-delete'></div>
        <div>v${pkg.version}</div>
      </div>`

    const sidebarContainer = document.querySelector('#sidebar-container')
    sidebarContainer?.appendChild(
      new Button({
        id: 'open-sidebar-button',
        title: 'Open sidebar',
        onClick: () =>
          // TODO: will be done through URL
          createEvent(LifeCycleEvents.SidebarOpenOrClose).dispatch(),
        html: `${fileListIcon}`,
        style: { border: 'none' },
      }).getElement()
    )
  }

  /**
   * Add or remove active class from the sidebar button
   */
  public setSidebarButtonActive(isActive: boolean) {
    const button = document.querySelector('#open-sidebar-button')
    if (!button) return
    isActive
      ? button.classList.add('open-sidebar-button-active')
      : button.classList.remove('open-sidebar-button-active')
  }

  public renderActiveNote(note: Note | null) {
    this.renderSaveButton(note)
    this.renderDeleteButton(note)
    this.renderSavedOn(
      note?.updatedAt ? new Date(note.updatedAt).toLocaleString() : null
    )
  }

  public renderRemoteDb({
    isConnected,
    isConnecting = false,
  }: {
    isConnected: boolean
    isConnecting?: boolean
  }) {
    const container = document.querySelector('#remote-db-setup-container')
    if (container) container.innerHTML = ''
    container?.appendChild(
      new Button({
        testId: 'setup-database',
        title: 'Setup database',
        style: {
          textWrap: 'nowrap',
        },
        html: `
        ${isConnecting ? new Loader().getElement().outerHTML : databaseIcon}
        <span>
          ${isConnecting ? 'Attempting connection...' : isConnected ? 'Online' : 'Offline'}
        </span>
        `,
        onClick: () =>
          createEvent(LifeCycleEvents.UrlChanged, {
            dialog: 'database',
          })?.dispatch(),
      }).getElement()
    )
  }

  public renderSavedOn(date: string | null) {
    this.renderDateSection({
      selector: '#status-bar-saved-on',
      date,
      label: 'Saved on',
      testId: 'status-bar-saved-on',
    })
  }

  public renderSyncedOn(date: string | null) {
    this.renderDateSection({
      selector: '#status-bar-synced-on',
      date,
      label: 'Synced on',
      testId: 'status-bar-synced-on',
    })
  }

  public renderAlert(message: string | null) {
    const container = document.querySelector('#status-bar-alert')
    if (container) container.innerHTML = ''
    if (!message) return
    container?.appendChild(
      new Button({
        testId: 'alert-error',
        title: 'Setup remote database',
        html: `
        ${errorIcon} 
        <span>
          Error
        </span>
        `,
        onClick: () =>
          createEvent(LifeCycleEvents.UrlChanged, {
            dialog: 'database',
          })?.dispatch(),
      }).getElement()
    )
  }

  private renderSaveButton(note: Note | null) {
    const container = document.querySelector('#status-bar-save')
    if (container) container.innerHTML = ''
    const saveButton = new Button({
      testId: 'save-note',
      title: 'Save note',
      html: saveIcon,
      onClick: createEvent(NoteEvents.Save)?.dispatch,
    })
    saveButton.setEnabled(!!note)
    container?.appendChild(saveButton.getElement())
  }

  private renderDeleteButton(note: Note | null) {
    const container = document.querySelector('#status-bar-delete')
    if (container) container.innerHTML = ''
    const settingsButton = new Button({
      testId: 'delete-note',
      title: 'Delete note',
      html: deleteIcon,
      onClick: () =>
        createEvent(LifeCycleEvents.UrlChanged, {
          dialog: 'delete',
        })?.dispatch(),
    })
    settingsButton.setEnabled(!!note)
    container?.appendChild(settingsButton.getElement())
  }

  private renderDateSection({
    selector,
    date,
    label,
    testId,
  }: {
    selector: string
    date: Date | string | null
    label: string
    testId: string
  }) {
    const container = document.querySelector(selector)
    if (container) container.innerHTML = ''
    if (!date) return // then keep the container cleared
    const span = document.createElement('span')
    span.appendChild(document.createTextNode(`${label}: ${date}`))
    span.setAttribute('data-testid', testId)
    container?.appendChild(span)
  }
}

const statusBar = new StatusBar()

export { statusBar }
