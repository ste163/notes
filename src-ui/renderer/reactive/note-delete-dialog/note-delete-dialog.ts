import { DIALOGS } from 'const'
import { NoteEvents, createEvent } from 'event'
import { Dialog, Button } from 'components'
import { deleteIcon } from 'icons'
import type { Note } from 'types'
import './note-delete-dialog.css'

class NoteDeleteDialog {
  private note: Note | null = null
  private dialog: Dialog | null = null

  public render(note: Note) {
    if (this.dialog) this.close()
    this.note = note
    const dialogContent = document.createElement('div')

    dialogContent.innerHTML = `
      <div class='note-delete-container'>
        <h3 testid='delete-dialog-header'>Are you sure you want to delete <span class='delete-dialog-note-title'>${note.title}?</span></h3>
        <p>This action cannot be undone.</p>
      </div>`

    dialogContent.appendChild(
      new Button({
        testId: 'delete-forever',
        title: 'Delete note',
        html: `${deleteIcon}<span>Delete forever</span>`,
        onClick: () =>
          createEvent(NoteEvents.Delete, { note: this.note }).dispatch(),
        style: { marginTop: '1em' },
      }).getElement()
    )

    this.dialog = new Dialog()
    this.dialog.setContent({
      title: 'Delete',
      content: dialogContent,
      queryParam: DIALOGS.DELETE,
    })
    this.dialog.open()
  }

  public close() {
    this.dialog?.close()
  }

  public clear() {
    this.dialog = null
    this.note = null
  }
}

export { NoteDeleteDialog }
