import { Button } from 'components'
import { renderRemoteDbDialog } from '../remote-db-dialog/remote-db-dialog'
import {
  databaseIcon,
  errorIcon,
  fileListIcon,
  saveIcon,
  settingsIcon,
} from 'icons'
import { createEvent, DialogEvents, LifeCycleEvents, NoteEvents } from 'event'
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
        <div id='status-bar-settings'></div>
        <div>v${pkg.version}</div>
      </div>`

    const sidebarContainer = document.querySelector('#sidebar-container')
    sidebarContainer?.appendChild(
      new Button({
        id: 'open-sidebar-button',
        title: 'Open sidebar',
        onClick: () =>
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
    this.renderSettingsButton(note)
  }

  public renderRemoteDb({ isConnected }: { isConnected: boolean }) {
    const container = document.querySelector('#remote-db-setup-container')
    if (container) container.innerHTML = ''
    container?.appendChild(
      new Button({
        title: 'Setup remote database',
        style: {
          textWrap: 'nowrap',
        },
        html: `
        ${databaseIcon}
        <span>
          ${isConnected ? 'Connected' : 'Not connected'}
        </span>
        `,
        onClick: () =>
          renderRemoteDbDialog({
            isConnectedToRemote: isConnected,
            error: '',
          }),
      }).getElement()
    )
  }

  public renderSavedOn(date: string | null) {
    this.renderDateSection({
      selector: '#status-bar-saved-on',
      date,
      label: 'Saved on',
    })
  }

  public renderSyncedOn(date: string | null) {
    this.renderDateSection({
      selector: '#status-bar-synced-on',
      date,
      label: 'Synced on',
    })
  }

  public renderAlert(message: string) {
    const container = document.querySelector('#status-bar-alert')
    if (container) container.innerHTML = ''
    if (message)
      container?.appendChild(
        new Button({
          title: 'Setup remote database',
          html: `
        ${errorIcon} 
        <span>
          Error
        </span>
        `,
          onClick: () =>
            renderRemoteDbDialog({
              // TODO this should come from some state NOT passed in like this
              isConnectedToRemote: true, // because this isn't valid
              // THIS NEEDS TO BE AN EMITTED EVENT LIKE THE OTHER DIALOG
              error: message,
            }),
        }).getElement()
      )
  }

  private renderSaveButton(note: Note | null) {
    const container = document.querySelector('#status-bar-save')
    if (container) container.innerHTML = ''
    const saveButton = new Button({
      title: 'Save note',
      html: saveIcon,
      onClick: createEvent(NoteEvents.Save)?.dispatch,
    })
    saveButton.setEnabled(!!note)
    container?.appendChild(saveButton.getElement())
  }

  private renderSettingsButton(note: Note | null) {
    const container = document.querySelector('#status-bar-settings')
    if (container) container.innerHTML = ''
    const settingsButton = new Button({
      title: 'Note settings',
      html: settingsIcon,
      onClick: createEvent(DialogEvents.OpenNoteDetails)?.dispatch,
    })
    settingsButton.setEnabled(!!note)
    container?.appendChild(settingsButton.getElement())
  }

  private renderDateSection({
    selector,
    date,
    label,
  }: {
    selector: string
    date: Date | string | null
    label: string
  }) {
    const container = document.querySelector(selector)
    if (container) container.innerHTML = ''
    if (!date) return // then keep the container cleared
    const span = document.createElement('span')
    span.appendChild(document.createTextNode(`${label}: ${date}`))
    container?.appendChild(span)
  }
}

const statusBar = new StatusBar()

export { statusBar }
