import { Button } from 'components'
import { renderRemoteDbDialog } from '../remote-db-dialog/remote-db-dialog'
import { databaseIcon, errorIcon } from 'icons'
import pkg from '../../../../package.json'
import './footer.css'

class Footer {
  /**
   * Allows for re-rendering the footer
   */
  public render() {
    const container = document.querySelector('footer')
    if (!container) throw new Error('Footer container not found')
    container.innerHTML = '' // reset container
    container.innerHTML = `
      <div class='footer-data-container'>
        <div id="remote-db-setup-container"></div>
        <div id="footer-last-sync"></div>
        <div id="footer-last-save"></div>
      </div>
      <div class='footer-status-container'>
        <div id="footer-alert"></div>
        <div>v${pkg.version}</div>
      </div>`
  }

  public renderRemoteDb({ isConnected }: { isConnected: boolean }) {
    const container = document.querySelector('#remote-db-setup-container')
    if (container) container.innerHTML = ''
    container?.appendChild(
      new Button({
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
      }).getElement()
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
        new Button({
          title: 'Setup remote database',
          className: 'footer-alert',
          html: `
        ${errorIcon} 
        <span>
          Error
        </span>
        `,
          onClick: () =>
            renderRemoteDbDialog({
              // TODO this should come from some state NOT passed in like this
              isConnectedToRemote: true, // because this isn't valid
              error: message,
            }),
        }).getElement()
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
