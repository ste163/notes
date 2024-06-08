import { Button } from 'components'
import { renderRemoteDbDialog } from '../remote-db-dialog/remote-db-dialog'
import { databaseIcon, errorIcon, saveIcon, settingsIcon } from 'icons'
import { createEvent, DialogEvents, NoteEvents } from 'event'
import pkg from '../../../../package.json'
import type { Note } from 'types'
import './status-bar.css'

class StatusBar {
  public render() {
    const container = document.querySelector('#status-bar')
    if (!container) throw new Error('Status bar container not found')
    container.innerHTML = '' // reset container
    container.innerHTML = `
      <div class='status-bar-database-container'>
        <div id='remote-db-setup-container'></div>
        <div id='status-bar-synced-on' class='status-bar-date status-bar-hide-on-mobile'></div>
      </div>
      <div id='status-bar-title-container'></div>
      <div class='status-bar-status-container'>
        <div id='status-bar-saved-on' class='status-bar-date status-bar-hide-on-mobile'></div>
        <div id='status-bar-alert'></div>
        <div id='status-bar-save'></div>
        <div id='status-bar-settings'></div>
        <div>v${pkg.version}</div>
      </div>`
  }

  public renderActiveNote(note: Note | null) {
    this.renderSaveButton(note)
    this.renderSettingsButton(note)
    this.updateTitle(note?.title || 'No note selected')
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

  private updateTitle(title: string) {
    const container = document.querySelector('#status-bar-title-container')
    if (container) container.innerHTML = ''
    const span = document.createElement('span')
    span.appendChild(document.createTextNode(title))
    span.classList.add(title ? 'status-bar-title' : 'status-bar-title-disabled')
    container?.appendChild(span)
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
