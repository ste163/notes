import { instantiateButton } from 'components'
import { renderRemoteDbSetupDialog } from './remote-db-setup-dialog'
import { databaseIcon } from 'icons'
import pkg from '../../../package.json'
import './footer.css'

class Footer {
  constructor() {
    const container = document.querySelector('footer')
    if (!container) throw new Error('Unable to find footer container')
    container.innerHTML = `
      <div class='footer-data-container'>
        <div id="remote-db-setup-container"></div>
        <div id="last-sync-date"></div>
        <div id="last-save-date"></div>
      </div>
      <div>v${pkg.version}</div>`
  }

  public renderRemoteDb(isConnected: boolean) {
    const container = document.querySelector('#remote-db-setup-container')
    if (container) container.innerHTML = ''
    container?.appendChild(
      instantiateButton({
        title: 'Setup remote database',
        html: `
          ${databaseIcon}
          <span>
            ${isConnected ? 'Connected' : 'Not connected'}
          </span>
          `,
        onClick: () =>
          renderRemoteDbSetupDialog({
            isConnectedToRemote: isConnected,
            error: '',
          }),
      })
    )
  }

  public renderLastSaved(date: string | null) {
    this.renderDateSection({
      selector: '#last-save-date',
      date,
      label: 'Last saved',
    })
  }

  public renderLastSynced(date: string | null) {
    this.renderDateSection({
      selector: '#last-sync-date',
      date,
      label: 'Last synced',
    })
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
    container?.appendChild(this.createDivider())
    container?.appendChild(span)
  }

  private createDivider() {
    const parent = document.createElement('div')
    parent.style.position = 'relative'
    parent.style.margin = '0 0.5rem'
    const divider = document.createElement('div')
    divider.classList.add('footer-divider')
    parent.appendChild(divider)
    return parent
  }
}

const footer = new Footer()

export { footer }
