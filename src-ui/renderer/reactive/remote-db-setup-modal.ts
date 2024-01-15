import { StatusStore } from 'store'
import { renderModal } from 'components'
import { logContainerId } from 'logger'
import { createEvent } from 'event'
import { useRemoteDetails } from 'database'
import { databaseIcon } from '../icons'
import { renderRemoteDbLogs } from './remote-db-logs'
import type { RemoteDetails } from 'types'
import './remote-db-setup-modal.css'

// TODO:
// when a state change occurs, the modal is going to close.
// Use url params to track the open/close state

function renderRemoteDbSetupModal() {
  const { isConnectedToRemote, error } = StatusStore

  const modalContent = document.createElement('div')

  // TODO:
  // test that if i disconnect from 1 database
  // and connect to a brand new one
  // that all my data from my local is synced to the new remote.

  modalContent.innerHTML = `
      <div class='remote-db-setup-container'>
        <section>
          <h3 class="remote-db-connection-heading">Connection details</h3>
          <form id="remote-db-connection-form">
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <title>Error icon</title>
                      <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path>
                      </svg>
                    </div>
                    <span>${error}</span>`
                  : isConnectedToRemote
                    ? `
                    <div class='remote-db-status-icon'>  
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <title>Success icon</title>
                        <path d="M12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598L12 1ZM12 3.04879L5 4.60434V13.7889C5 15.1263 5.6684 16.3752 6.7812 17.1171L12 20.5963L17.2188 17.1171C18.3316 16.3752 19 15.1263 19 13.7889V4.60434L12 3.04879ZM16.4524 8.22183L17.8666 9.63604L11.5026 16L7.25999 11.7574L8.67421 10.3431L11.5019 13.1709L16.4524 8.22183Z"></path>
                      </svg>
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
        </section>
      </div>`

  renderModal({
    title: 'Remote Database',
    content: modalContent,
    classList: 'remote-db-setup-modal',
  })

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

  const localStorageDetails = useRemoteDetails().get()

  inputElements.forEach((element) => {
    // if the element id is the same as the key in localStorageDetails
    // assign the default value to the input
    if (element.id in localStorageDetails) {
      element.defaultValue = localStorageDetails[element?.id]
    }
  })

  /**
   * setup buttons
   */
  const disconnectButton = document.querySelector('#disconnect-button')
  disconnectButton?.addEventListener(
    'click',
    createEvent('remote-db-disconnect').dispatch
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
    createEvent('remote-db-connect').dispatch()
  })

  const dbLogContainer = document.querySelector(logContainerId)
  if (dbLogContainer) renderRemoteDbLogs(dbLogContainer)
}

export { renderRemoteDbSetupModal }
