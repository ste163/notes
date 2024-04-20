import { StatusStore } from 'store'
import { instantiateButton } from 'components'
import { renderRemoteDbSetupDialog } from './remote-db-setup-dialog'
import { databaseIcon } from 'icons'
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

  container.innerHTML = `
  <div class='footer-data-container'>
    <div id="remote-db-setup-container"></div>
    <div id="last-sync-date"></div>
    <div id="last-save-date"></div>
  </div>
  <div>v${pkg.version}</div>`

  if (lastSyncedDate) renderLastSyncDate(lastSyncedDate)
  if (lastSavedDate) renderLastSavedDate(lastSavedDate)

  function renderRemoteDbButtonDialog() {
    document.querySelector(`#remote-db-setup-container`)?.appendChild(
      instantiateButton({
        title: 'Setup remote database',
        html: `
          ${databaseIcon}
          <span>
            ${isConnectedToRemote ? 'Connected' : 'Not connected'}
          </span>
          `,
        onClick: renderRemoteDbSetupDialog,
      })
    )
  }

  renderRemoteDbButtonDialog()
}

function createDivider() {
  const parent = document.createElement('div')
  parent.style.position = 'relative'
  parent.style.margin = '0 0.5rem'
  const divider = document.createElement('div')
  divider.classList.add('footer-divider')
  parent.appendChild(divider)
  return parent
}

function renderLastSavedDate(lastSavedDate: Date) {
  const span = document.createElement('span')
  span.appendChild(
    document.createTextNode(`Document  last saved: ${lastSavedDate}`)
  )
  const container = document.querySelector('#last-save-date')
  container?.appendChild(createDivider())
  container?.appendChild(span)
}

function renderLastSyncDate(lastSyncedDate: Date) {
  const span = document.createElement('span')
  span.appendChild(document.createTextNode(`Last synced: ${lastSyncedDate}`))
  const container = document.querySelector('#last-sync-date')
  container?.appendChild(createDivider())
  container?.appendChild(span)
}

export { renderFooter }
