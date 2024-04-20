import { StatusStore } from 'store'
import { instantiateButton } from 'components'
import { renderRemoteDbSetupDialog } from './remote-db-setup-dialog'
import { databaseIcon } from 'icons'
import pkg from '../../../package.json'
import './footer.css'

/**
 * Renders base footer
 */
function renderFooter(): void {
  // note: footer does not have a top-level loading state because each piece handles its own

  const container = document.querySelector('footer')
  if (!container) throw new Error('Unable to find footer container')

  const { lastSyncedDate, isConnectedToRemote } = StatusStore

  container.innerHTML = `
  <div class='footer-data-container'>
    <div id="remote-db-setup-container"></div>
    <div id="last-sync-date"></div>
    <div id="last-save-date"></div>
  </div>
  <div>v${pkg.version}</div>`

  // TODO: move to the syncing event
  if (lastSyncedDate) renderLastSyncDate(lastSyncedDate)

  // TODO: move to the syncing event
  renderRemoteDbButtonDialog(isConnectedToRemote)
}

function renderFooterLastSavedDate(date: string | null) {
  const container = document.querySelector('#last-save-date')
  if (container) container.innerHTML = ''
  if (!date) return // then keep the container cleared
  const span = document.createElement('span')
  span.appendChild(document.createTextNode(`Document  last saved: ${date}`))
  container?.appendChild(createDivider())
  container?.appendChild(span)
}

function renderRemoteDbButtonDialog(isConnected: boolean) {
  document.querySelector(`#remote-db-setup-container`)?.appendChild(
    instantiateButton({
      title: 'Setup remote database',
      html: `
        ${databaseIcon}
        <span>
          ${isConnected ? 'Connected' : 'Not connected'}
        </span>
        `,
      onClick: renderRemoteDbSetupDialog,
    })
  )
}

function renderLastSyncDate(lastSyncedDate: Date) {
  const container = document.querySelector('#last-sync-date')
  if (container) container.innerHTML = ''
  const span = document.createElement('span')
  span.appendChild(document.createTextNode(`Last synced: ${lastSyncedDate}`))
  container?.appendChild(createDivider())
  container?.appendChild(span)
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

export { renderFooter, renderFooterLastSavedDate }
