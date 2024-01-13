import { StatusStore } from 'store'
import { renderModal } from 'components'
import { databaseIcon } from '../icons'
import './remote-db-setup-modal.css'

// TODO: will probs be an issue:
// when a state change occurs, the modal is going to close.
// I don't want this to happen, so I'll need some kind of state-tracking
// for opening a modal after a re-render

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
          <h3 class="remote-db-status-heading">Status</h3>
          <div class="remote-db-status-container">
            ${
              error
                ? `                              
                <div class='remote-db-status-icon'>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <title>Error icon</title>
                  <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path>
                  </svg>
                </div>
                <span>${error}</span>
                <div class="remote-db-status-logs">Error logs...</div>`
                : isConnectedToRemote
                  ? `
                  <div class='remote-db-status-icon'>  
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <title>Success icon</title>
                      <path d="M12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598L12 1ZM12 3.04879L5 4.60434V13.7889C5 15.1263 5.6684 16.3752 6.7812 17.1171L12 20.5963L17.2188 17.1171C18.3316 16.3752 19 15.1263 19 13.7889V4.60434L12 3.04879ZM16.4524 8.22183L17.8666 9.63604L11.5026 16L7.25999 11.7574L8.67421 10.3431L11.5019 13.1709L16.4524 8.22183Z"></path>
                    </svg>
                  </div>
                  <span>Successfully connected to remote database.</span>
                  <div class="remote-db-status-logs">Most recent action logged here...</div>`
                  : `
                    <div class='remote-db-status-icon'>
                      ${databaseIcon}
                    </div>
                    <span>Not connected to remote database.</span>`
            }
          </div>
          ${
            // TODO: move to a more logical section. Maybe below near the connection details?
            isConnectedToRemote
              ? `<div class="remote-db-status-buttons">
              <button>Disconnect from remote</button>
            </div>`
              : ''
          }
        </section>
  
        <section>
          <h3>Connection details</h3>
          <form>
            <input type="text" id="username" name="username" placeholder="Username">
            <input type="password" id="password" name="password" placeholder="Password">
            <input type="text" id="host" name="host" placeholder="Host">
            <input type="text" id="port" name="port" placeholder="Port">
            <button type="submit">Connect</button>
          </form>
        </section>
  
        <section>
          <h3>Need help?</h3>
          <div>To setup a remote Docker-based database for this application, visit: <a target="_blank" href="https://github.com/ste163/couchdb-docker">Github</a>.</div>
        </section>
      </div>`

  renderModal({
    title: 'Remote Database',
    content: modalContent,
    classList: 'remote-db-setup-modal',
  })
}

export { renderRemoteDbSetupModal }
