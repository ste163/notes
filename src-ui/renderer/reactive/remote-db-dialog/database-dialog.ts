import { Dialog } from 'components'
import { logger } from 'logger'
import { DatabaseEvents, createEvent } from 'event'
import { useRemoteDetails } from 'database'
import { databaseIcon, errorIcon, checkIcon } from 'icons'
import { renderRemoteDbLogs } from './remote-db-logs'
import type { RemoteDetails } from 'database'
import './database-dialog.css'

// TODO (final manual test for syncing):
// test that if I disconnect from one database
// and connect to a brand new one
// that all my data from my local is synced to the new remote.
//
// Also check that if I have a different DB on my local, disconnect
// then connect to a NEW db with different data, see what happens. Do they all merge together?
// once I figure out, need to document the results.
//
// Depending on results, allow for the Database class to swap
// its syncing mode: ie, user defines which approach they want

class DatabaseDialog {
  private dialog: Dialog | null = null
  private isConnectedToRemote = false
  private error: string | null = null

  public render() {
    this.reset()
    const dialogContent = document.createElement('div')

    dialogContent.innerHTML = `
      <section id='database-dialog-status'></section>
      <section id='database-dialog-connection-details'></section>
      <section id='database-dialog-help'>
        <h3>Need help?</h3>
        <p>To setup a remote, Docker-based database for this application, visit <a target="_blank" href="https://github.com/ste163/couchdb-docker">this project on Github</a>.</p>
      </section>`

    this.dialog = new Dialog()
    this.dialog.setContent({
      title: 'Database',
      content: dialogContent,
      url: 'database',
      classList: 'database-dialog',
    })

    this.dialog.open()
    this.renderStatus()
    this.renderConnectionForm()
  }

  private reset() {
    if (this.dialog) this.dialog.close()
  }

  public setConnectionStatus(isConnected: boolean) {
    this.isConnectedToRemote = isConnected
    // TODO: when this is called,
    // attempt to re-render the status section
  }

  public setError(error: string) {
    this.error = error
    // TODO: when this is called,
    // attempt to re-render the status section
  }

  public renderStatus() {
    const container = document.querySelector('#database-dialog-status')
    // TODO: maybe do not throw the error so then I can call the re-rendering whenever
    // without any issues
    if (!container) throw new Error('Status container not found')

    const renderConnectionStatus = () =>
      this.isConnectedToRemote
        ? `
            <div class='database-dialog-status-icon'>  
              ${checkIcon}
            </div>
            <span>Online, syncing to database.</span>`
        : `
            <div class='database-dialog-status-icon'>
              ${databaseIcon}
            </div>
            <span>Offline, saving to this device.</span>`

    const renderErrorStatus = () =>
      this.error
        ? `
          <div class='database-dialog-status-icon'>
            ${errorIcon}
          </div>  
          <span>${this.error}</span>`
        : `
          <div class='database-dialog-status-icon'>
            ${checkIcon}
          </div>
          <span>Good. No recent errors.</span>`

    container.innerHTML = `
      <h3>Status</h3>
      <div class='database-dialog-status-container'>${renderErrorStatus()}</div>
      <div class='database-dialog-status-container'>${renderConnectionStatus()}</div>
      `
    // TODO:
    // BUTTON FOR: Show all recent activity (for developers)
  }

  public renderConnectionForm() {
    const container = document.querySelector(
      '#database-dialog-connection-details'
    )
    if (!container) throw new Error('Connection details container not found')
    container.innerHTML = `
      <h3>Connection details</h3>
      TODO: setup`
    // TODO: setup form
  }
}

const databaseDialog = new DatabaseDialog()

export { databaseDialog }

export function renderRemoteDbDialog(isConnectedToRemote: boolean) {
  const dialogContent = document.createElement('div')

  dialogContent.innerHTML = `
    <section>
      <h3>Status</h3>
      <div id="remote-db-logs" class="code-block"></div>
    </section>

        <section class="remote-db-setup-dialog">
          <h3>Connection details</h3>
          <form>
            <label for="username">Username</label>
            <input type="text" id="username" name="username" placeholder="admin">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="password">
            <label for="host">Host</label>
            <input type="text" id="host" name="host" placeholder="192.168.0.**">
            <label for="port">Port</label>
            <input type="text" id="port" name="port" placeholder="5984">
            <div>
              <button id="connect-button" type="submit">Connect</button>
              ${
                isConnectedToRemote
                  ? `<button id="disconnect-button">Disconnect from remote</button>`
                  : ''
              }
            </div>
          </form>
        </section>`

  /**
   * setup listeners for rendered elements
   */
  const form = document.querySelector('#remote-db-connection-form')
  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    event.stopPropagation()
  })

  /**
   * setup inputs
   */
  const inputElements = ['username', 'password', 'host', 'port'].map(
    (input) => {
      const element = document.querySelector(`#${input}`) as HTMLInputElement
      if (!element) throw new Error(`Missing input element: ${input}`)
      return element
    }
  )

  const details = useRemoteDetails().get()

  inputElements.forEach((element) => {
    // if the element id is the same as the key in details
    // assign the default value to the input
    if (element.id in details) {
      element.defaultValue = details[element?.id]
    }
  })

  /**
   * setup buttons
   */
  const disconnectButton = document.querySelector('#disconnect-button')
  disconnectButton?.addEventListener(
    'click',
    createEvent(DatabaseEvents.RemoteDisconnect).dispatch
  )

  const connectButton = document.querySelector('#connect-button')
  connectButton?.addEventListener('click', () => {
    const details = inputElements.reduce((acc, element) => {
      return {
        ...acc,
        [element.id]: element.value,
      }
    }, {} as RemoteDetails)
    useRemoteDetails().set(details)
    createEvent(DatabaseEvents.RemoteConnect).dispatch()
  })

  const dbLogContainer = document.querySelector('#remote-db-logs')
  if (dbLogContainer) renderRemoteDbLogs(dbLogContainer, logger.getLogs())
}
