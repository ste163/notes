import { StatusStore } from 'store'
import { renderButton } from 'components'
import { renderRemoteDbSetupModal } from './remote-db-setup-modal'
import { databaseIcon } from '../icons'
import pkg from '../../../package.json'
import './footer.css'

/**
 * Renders footer with latest StatusStore state
 */
function renderFooter(footerContainer: Element): void {
  const { lastSavedDate, lastSyncedDate, isConnectedToRemote } = StatusStore

  const remoteDbContainerId = 'remote-db-setup-container'

  // TODO (and test):
  // 3 states to handle:
  // - no setup at all for a database -> render based on localStorage db data
  // - setup + not connected
  // - initial render + loading/attempting to setup syncing
  // - setup + connected (no error)
  // - setup + connected (error has occurred)

  footerContainer.innerHTML = `
  <div class='footer-data-container'>
    <div>
      <div id="${remoteDbContainerId}"></div>
      ${
        lastSyncedDate
          ? `
          <div class="footer-divider"></div>
          <div>
            Last synced: ${lastSyncedDate}
          </div>`
          : ''
      }
    </div>
    ${
      lastSavedDate
        ? `
        <div class="footer-divider"></div>
        <div>
          Document ${lastSavedDate ? `last saved: ${lastSavedDate}` : ''}
        </div>
      `
        : ''
    }
  </div>
  <div>
    v${pkg.version}
  </div>`

  /**
   * Add dynamic sections to footer
   */
  const remoteDbSetupButton = renderButton({
    title: 'Setup remote database',
    html: `
      ${databaseIcon}
      <span>
        ${isConnectedToRemote ? 'Connected' : 'Not connected'}
      </span>
      `,
    onClick: renderRemoteDbSetupModal,
  })

  const remoteDbContainer = document.querySelector(`#${remoteDbContainerId}`)
  remoteDbContainer?.appendChild(remoteDbSetupButton)
}

export { renderFooter }
