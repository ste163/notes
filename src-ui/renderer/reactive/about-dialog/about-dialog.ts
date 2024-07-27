import { DIALOGS } from 'const'
import { Dialog } from 'components'
import pkg from '../../../../package.json'
import './about-dialog.css'

class AboutDialog {
  private dialog: Dialog | null = null

  public render() {
    if (this.dialog) this.close()
    const dialogContent = document.createElement('div')

    dialogContent.innerHTML = `
      <div class='about-container'>
        <h3>notes v${pkg.version}</h3>
        <p>Notes is a free and open source writing application.
        It is licensed under the <strong>AGPL-3.0</strong>.
        To view information on the latest release,
        visit the <a target="_blank" href="https://github.com/ste163/notes/releases" >project's github repository</a>.</p>
        <button>View AGPL-3.0 License</button>
        <h3>Other open source licenses</h3>
        <p>
            Notes would not be possible without the following open source projects:
            <ul>
                <li>TipTap (writing editor)</li>
                <li>PouchDb (cloud-syncing database)</li>
                <li>Tauri (desktop and mobile application support)</li>
            </ul>
            Tauri, PouchDb, and the icon pack from Remix Icons are all licensed under the Apache License 2.0 or MIT.
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
  }

  public close() {
    this.dialog?.close()
  }

  public clear() {
    this.dialog = null
  }
}

export { AboutDialog }
