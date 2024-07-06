import { NoteEvents, createEvent } from 'event'
import { Dialog, Button } from 'components'
import { deleteIcon } from 'icons'
import type { Note } from 'types'
import './note-delete-dialog.css'

class NoteDeleteDialog {
  private note: Note | null = null
  private dialog: Dialog | null = null

  public render(note: Note) {
    this.reset()
    this.note = note
    const dialogContent = document.createElement('div')

    dialogContent.innerHTML = `
      <div class='note-delete-container'>
        <h3>Are you sure you want to delete this note?</h3>
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
      url: 'delete',
    })
    this.dialog.open()
  }

  private reset() {
    if (this.dialog) this.dialog.close()
  }
}

const noteDeleteDialog = new NoteDeleteDialog()

export { noteDeleteDialog }
