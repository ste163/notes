import { StatusStore } from 'store'
import { instantiateButton } from 'components'
import { renderRemoteDbSetupModal } from './remote-db-setup-modal'
import { databaseIcon } from '../icons'
import pkg from '../../../package.json'
import './footer.css'

/**
 * Renders footer with latest StatusStore state
 */
function renderFooter(): void {
  // note: footer does not have a top-level loading state because each piece handles its own

  const container = document.querySelector('footer')
  if (!container) throw new Error('Unable to find footer container')

  const { lastSavedDate, lastSyncedDate, isConnectedToRemote } = StatusStore
  const remoteDbContainerId = 'remote-db-setup-container'

  // TODO (and test):
  // 3 states to handle:
  // - no setup at all for a database -> render based on localStorage db data
  // - setup + not connected
  // - initial render + loading/attempting to setup syncing
  // - setup + connected (no error)
  // - setup + connected (error has occurred)

  container.innerHTML = `
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
  const remoteDbSetupButton = instantiateButton({
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
