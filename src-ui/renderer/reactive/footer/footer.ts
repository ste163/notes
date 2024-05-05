import { instantiateButton } from 'components'
import { renderRemoteDbDialog } from '../remote-db-dialog/remote-db-dialog'
import { databaseIcon } from 'icons'
import pkg from '../../../../package.json'
import './footer.css'

// TODO: new feature: error alert if an error is caught
class Footer {
  constructor() {
    this.init()
  }

  /**
   * Allows for re-rendering the footer
   */
  public init() {
    const container = document.querySelector('footer')
    if (!container) {
      /**
       * Not throwing an error because tests would break.
       * If the footer isn't found, then the index.html
       * is broken, and that issue would be caught sooner
       */
      console.warn('Footer container not found')
      return
    }
    container.innerHTML = '' // reset container
    container.innerHTML = `
      <div class='footer-data-container'>
        <div id="remote-db-setup-container"></div>
        <div id="footer-last-sync"></div>
        <div id="footer-last-save"></div>
      </div>
      <div id="footer-alert"></div>
      <div>v${pkg.version}</div>`
  }

  public renderRemoteDb({ isConnected }: { isConnected: boolean }) {
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
          renderRemoteDbDialog({
            isConnectedToRemote: isConnected,
            error: '',
          }),
      })
    )
  }

  public renderLastSaved(date: string | null) {
    this.renderDateSection({
      selector: '#footer-last-save',
      date,
      label: 'Last saved',
    })
  }

  public renderLastSynced(date: string | null) {
    this.renderDateSection({
      selector: '#footer-last-sync',
      date,
      label: 'Last synced',
    })
  }

  public renderAlert(message: string) {
    const container = document.querySelector('#footer-alert')
    if (container) container.innerHTML = ''
    if (message)
      container?.appendChild(
        instantiateButton({
          title: 'Setup remote database',
          // TODO: look for an alert icon
          // and style with a reddish color
          html: `
          ${databaseIcon}
          <span>
            Alert
          </span>
          `,
          onClick: () =>
            renderRemoteDbDialog({
              // TODO this should come from some state NOT passed in like this
              isConnectedToRemote: true,
              error: message,
            }),
        })
      )
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
