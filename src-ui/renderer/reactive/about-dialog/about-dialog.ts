import { DIALOGS } from 'const'
import { Dialog, Button } from 'components'
import pkg from '../../../../package.json'
import './about-dialog.css'

class AboutDialog {
  private dialog: Dialog | null = null

  // Use the same toggling and styling method as the Database Dialog developer console

  public render() {
    if (this.dialog) this.close()
    const dialogContent = document.createElement('div')
    dialogContent.innerHTML = `
      <div class='about-container'>
        <h3>notes v${pkg.version}</h3>
        <p>
          Notes is a free and open source writing application.
          To view information on the latest release,
          visit the <a target="_blank" href="https://github.com/ste163/notes/releases" >project's github repository</a>.
          It is licensed under the <strong>AGPL-3.0</strong>.
        </p>
        <div>
          <div id='notes-license-button'></div>
          <div id='notes-license-block-container'></div>
        </div>
        <h3>Open source licenses</h3>
        <p>
            Notes would not be possible without the following open source projects:
        </p>
          <ul>
              <li>PouchDb (cloud-syncing database)</li>
              <li>Remix Icons (icon pack)</li>
              <li>Tauri (desktop and mobile application support)</li>
              <li>TipTap (writing editor)</li>
          </ul>
          <p>
            Tauri, PouchDb, and Remix Icons are all licensed under the Apache License 2.0 or MIT.
          </p>
        <button>View Apache 2.0 License</button>
      </div>`

    this.dialog = new Dialog()
    this.dialog.setContent({
      title: 'About',
      content: dialogContent,
      queryParam: DIALOGS.ABOUT,
    })
    this.dialog.open()

    // it's on the DOM, so we can add the buttons
    this.renderNotesLicense()
  }

  public close() {
    this.dialog?.close()
  }

  public clear() {
    this.dialog = null
  }

  private renderNotesLicense() {
    document.querySelector('#notes-license-button')?.appendChild(
      new Button({
        title: 'View AGPL-3.0 License',
        html: 'View AGPL-3.0 License',
        onClick: () => {
          const container = document.querySelector(
            '#notes-license-block-container'
          )
          if (!container) return
          const isAlreadyOnDOM = document.querySelector('#notes-license-block')
          isAlreadyOnDOM
            ? (container.innerHTML = '')
            : this.renderLicenseBlock(container, 'AGPL-3.0')
        },
      }).getElement()
    )
  }

  private renderLicenseBlock(element: Element, license: string) {
    element.innerHTML = '' // reset container
    const licenseBlock = document.createElement('div')
    licenseBlock.id = 'notes-license-block'
    licenseBlock.classList.add('code-block')
    licenseBlock.innerHTML = license
    element.appendChild(licenseBlock)
  }
}

export { AboutDialog }
