import { Dialog } from 'components'
import { logger } from 'logger'
import { DatabaseEvents, createEvent } from 'event'
import { useRemoteDetails } from 'database'
import { databaseIcon, errorIcon, successIcon } from 'icons'
import { renderRemoteDbLogs } from './remote-db-logs'
import type { RemoteDetails } from 'types'
import './remote-db-dialog.css'

/**
 * NOTE: status bar needs its text updated to match whatever approaches I take below...
 *
 * WHAT IS MOST IMPORTANT?
 * - inform user on which database they're using (local or remote). Or more product-language of:
 *  "Offline or Online"
 * - What are the details to your remote connection
 * - What are the recent logs/status/errors that have occurred
 * - Link to the HELP section for setting up a remote database (should be with the remote details section)
 *
 * DEFAULT OPENING/CLOSING
 * - accordion menus for the different sections that can be open or closed based on how the dialog is opened
 *   (thinking here is whether your setting up the connection, if it is connected, if there is an error)
 *
 * VISUAL LAYOUT:
 * Status (Offline/Online) with the db icon
 *  - in smaller text below it can be more specific as "Saving locally to your device" or "Syncing to your remote database"
 *      - Could also mention that we save locally and THEN sync to the remote
 *  - underneath this status section can be an accordion for "View log of recent actions (for developers)"
 * Then the accordion for Connection Details, or Remote Database Connection Setup.
 *
 * GOTCHAS:
 * The trick here is that the entire dialog should be able to re-render its separate pieces
 * as needed: whether the dialog is open or closed. We always need the latest data.
 */

function renderRemoteDbDialog({
  isConnectedToRemote,
  error,
}: {
  isConnectedToRemote: boolean
  error: string
}) {
  // TODO: refactor
  // TODO: needs to know about the db connection state
  // and any major error states

  const dialogContent = document.createElement('div')

  // TODO:
  // manually test:
  // test that if i disconnect from 1 database
  // and connect to a brand new one
  // that all my data from my local is synced to the new remote.

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
        </section>

        <section>
          <h3>Status</h3>
          <div class="remote-db-status-container">
            <div>
              ${
                error
                  ? `     
                    <div class='remote-db-status-icon'>
                      ${errorIcon}
                    </div>
                    <span>Error: ${error}</span>`
                  : isConnectedToRemote
                    ? `
                    <div class='remote-db-status-icon'>  
                      ${successIcon}
                    </div>
                    <span>Successfully connected to remote database.</span>`
                    : `
                      <div class='remote-db-status-icon'>
                        ${databaseIcon}
                      </div>
                      <span>Not connected to remote database.</span>`
              }
            </div>
            <div id="remote-db-logs" class="code-block"></div>
          </div>
        </section>

        <section>
          <h3>Need help?</h3>
          <div>To setup a remote, Docker-based database for this application, visit <a target="_blank" href="https://github.com/ste163/couchdb-docker">this project on Github</a>.</div>
        </section>`

  const dialog = new Dialog()

  dialog.setContent({
    title: 'Remote Database',
    content: dialogContent,
    url: 'database',
    classList: 'remote-db-setup-dialog',
  })

  dialog.open()

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

export { renderRemoteDbDialog }
