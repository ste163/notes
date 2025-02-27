import { DIALOGS } from 'const'
import { Dialog, Button } from 'components'
import pkg from '../../../../package.json'
import { markdown as agplLicense } from '../../../../LICENSE.md'
import { markdown as apacheLicense } from '../../../../apache-license.md'
import './about-dialog.css'

class AboutDialog {
  private dialog: Dialog | null = null

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
          <div id='agpl-license-button'></div>
          <div id='agpl-license-block-container'></div>
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
        <div>
          <div id='apache-license-button'></div>
          <div id='apache-license-block-container'></div>
        </div>
      </div>`

    this.dialog = new Dialog()
    this.dialog.setContent({
      title: 'About',
      content: dialogContent,
      queryParam: DIALOGS.ABOUT,
    })
    this.dialog.open()

    this.renderNotesLicense()
    this.renderOtherLicense()
  }

  public close() {
    this.dialog?.close()
  }

  public clear() {
    this.dialog = null
  }

  private renderNotesLicense() {
    document.querySelector('#agpl-license-button')?.appendChild(
      new Button({
        testId: 'view-agpl',
        title: 'View AGPL-3.0 License',
        html: 'View AGPL-3.0 License',
        onClick: () => {
          const container = document.querySelector(
            '#agpl-license-block-container'
          )
          if (!container) return
          const isAlreadyOnDOM = document.querySelector('#agpl-license-block')
          if (isAlreadyOnDOM) container.innerHTML = ''
          else
            this.renderLicenseBlock(
              'agpl-license-block',
              container,
              agplLicense
            )
        },
      }).getElement()
    )
  }

  private renderOtherLicense() {
    document.querySelector('#apache-license-button')?.appendChild(
      new Button({
        testId: 'view-apache',
        title: 'View Apache 2.0 License',
        html: 'View Apache 2.0 License',
        onClick: () => {
          const container = document.querySelector(
            '#apache-license-block-container'
          )
          if (!container) return
          const isAlreadyOnDOM = document.querySelector('#apache-license-block')
          if (isAlreadyOnDOM) container.innerHTML = ''
          else
            this.renderLicenseBlock(
              'apache-license-block',
              container,
              apacheLicense
            )
        },
      }).getElement()
    )
  }

  private renderLicenseBlock(id: string, element: Element, license: string) {
    element.innerHTML = '' // reset container
    const licenseBlock = document.createElement('div')
    licenseBlock.id = id
    licenseBlock.setAttribute('data-testid', id)
    licenseBlock.classList.add('code-block')
    licenseBlock.innerHTML = license
    element.appendChild(licenseBlock)
  }
}

export { AboutDialog }
