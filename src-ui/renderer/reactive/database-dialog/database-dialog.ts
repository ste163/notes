import { Button, Dialog } from 'components'
import { logger } from 'logger'
import { DatabaseEvents, createEvent } from 'event'
import { useRemoteDetails } from 'database'
import { databaseIcon, errorIcon, checkIcon } from 'icons'
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
  private areLogsShown = false
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
    this.areLogsShown = false
  }

  public setConnectionStatus(isConnected: boolean) {
    this.isConnectedToRemote = isConnected
    this.renderStatus() // used to re-render state if dialog is open
  }

  public setError(error: string) {
    this.error = error
    this.renderStatus()
  }

  public renderStatus() {
    const container = document.querySelector('#database-dialog-status')
    if (!container) return

    const renderConnectionStatus = () =>
      this.isConnectedToRemote
        ? `
            <div class='database-dialog-status-icon'>  
              ${databaseIcon}
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

    const renderDatabaseLogs = (shouldShow: boolean) => {
      const container = document.querySelector(
        '#database-dialog-status-log-block-container'
      )
      if (!container) return

      container.innerHTML = ''
      if (!shouldShow) return

      const div = document.createElement('div')

      div.id = 'database-dialog-status-log-block'
      div.classList.add('code-block')

      // TODO: based on logs '[type]' assign color coding (errors are an accessible red)
      const logs = logger.getLogs()
      if (logs.length)
        div.innerHTML = logs
          .map((log) => `<p>${log}</p>`)
          .reduce((acc, curr) => acc + curr)
      // set logs to always scroll to bottom, so most recent is in view
      div.scrollTop = div?.scrollHeight

      container.appendChild(div)
    }

    // setup main status section structure
    container.innerHTML = `
      <h3>Status</h3>
      <div class='database-dialog-status-container'>${renderErrorStatus()}</div>
      <div class='database-dialog-status-container'>${renderConnectionStatus()}</div>
      <div id='database-dialog-status-log-container'>
        <div id='database-dialog-status-log-button'></div>
        <div id='database-dialog-status-log-block-container'></div>
      </div>`

    document.querySelector('#database-dialog-status-log-button')?.appendChild(
      new Button({
        title: 'Toggle recent activity logs (for developers)',
        html: 'Toggle recent activity logs (for developers)',
        onClick: () => {
          if (this.areLogsShown) {
            this.areLogsShown = false
            renderDatabaseLogs(this.areLogsShown)
          } else {
            this.areLogsShown = true
            renderDatabaseLogs(this.areLogsShown)
          }
        },
      }).getElement()
    )

    // if it's a re-render while the dialog is open, keep logs open
    if (this.areLogsShown) renderDatabaseLogs(this.areLogsShown)
  }

  public renderConnectionForm() {
    const container = document.querySelector(
      '#database-dialog-connection-details'
    )
    if (!container) throw new Error('Connection details container not found')
    container.innerHTML = `
      <h3>Connection details</h3>`
    // TODO: setup form
  }
}

const databaseDialog = new DatabaseDialog()

export { databaseDialog }

// BELOW SHOULD BE DELETED AS REFACTORING OCCURS

export function renderRemoteDbDialog(isConnectedToRemote: boolean) {
  const dialogContent = document.createElement('div')

  dialogContent.innerHTML = `
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
}
