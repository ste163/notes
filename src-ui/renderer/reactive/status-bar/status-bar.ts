import { Button } from 'components'
import { renderRemoteDbDialog } from '../remote-db-dialog/remote-db-dialog'
import { databaseIcon, errorIcon, saveIcon, settingsIcon } from 'icons'
import { createEvent, DialogEvents, NoteEvents } from 'event'
import pkg from '../../../../package.json'
import './status-bar.css'
import type { Note } from 'types'

class StatusBar {
  public render() {
    const container = document.querySelector('#status-bar')
    if (!container) throw new Error('Status bar container not found')
    container.innerHTML = '' // reset container

    // New structure:
    // save + settings on the right after the alert, before version number
    // database information on the left
    // note title centered with a set width
    //
    // where does last saved date + last sync time go?

    container.innerHTML = `
      <div class='status-bar-data-container'>
        <div id='status-bar-note-container'></div>
        <div id='status-bar-last-save' class='hide-on-mobile'></div>
        <div id='remote-db-setup-container'></div>
        <div id='status-bar-last-sync' class='hide-on-mobile'></div>
      </div>
      <div class='status-bar-status-container'>
        <div id='status-bar-alert'></div>
        <div>v${pkg.version}</div>
      </div>`
  }

  public renderNoteSection(note: Note | null) {
    const container = document.querySelector('#status-bar-note-container')
    if (container) container.innerHTML = ''

    const saveButton = new Button({
      title: 'Save note',
      html: saveIcon,
      onClick: createEvent(NoteEvents.Save)?.dispatch,
    })

    const settingsButton = new Button({
      title: 'Note settings',
      html: settingsIcon,
      onClick: createEvent(DialogEvents.OpenNoteDetails)?.dispatch,
    })

    // TODO
    // the note title should be centered in the status bar
    const title = document.createElement('span')
    title.appendChild(
      document.createTextNode(note?.title || 'No note selected')
    )
    title.classList.add(
      note?.title ? 'status-bar-note-title' : 'status-bar-note-title-disabled'
    )

    saveButton.setEnabled(!!note)
    settingsButton.setEnabled(!!note)
    container?.appendChild(title)
    container?.appendChild(saveButton.getElement())
    container?.appendChild(settingsButton.getElement())
  }

  public renderRemoteDb({ isConnected }: { isConnected: boolean }) {
    const container = document.querySelector('#remote-db-setup-container')
    if (container) container.innerHTML = ''
    container?.appendChild(this.createDivider())
    container?.appendChild(
      new Button({
        title: 'Setup remote database',
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

  public renderLastSaved(date: string | null) {
    this.renderDateSection({
      selector: '#status-bar-last-save',
      date,
      label: 'Last saved',
    })
  }

  public renderLastSynced(date: string | null) {
    this.renderDateSection({
      selector: '#status-bar-last-sync',
      date,
      label: 'Last synced',
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

  private createDivider() {
    const parent = document.createElement('div')
    // TODO: move this to the .css
    parent.style.position = 'relative'
    parent.style.margin = '0 0.5rem'
    const divider = document.createElement('div')
    divider.classList.add('status-bar-divider')
    parent.appendChild(divider)
    return parent
  }
}

const statusBar = new StatusBar()

export { statusBar }
