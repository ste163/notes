import { DIALOGS } from 'const'
import { Dialog } from 'components'
import './about-dialog.css'

class AboutDialog {
  private dialog: Dialog | null = null

  public render() {
    if (this.dialog) this.close()
    const dialogContent = document.createElement('div')

    dialogContent.innerHTML = `
      <div class='about-container'>
        <h3>ABOUT!</h3>
        <p>Blah blah blah.</p>
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
