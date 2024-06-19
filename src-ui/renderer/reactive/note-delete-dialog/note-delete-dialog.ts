import { NoteEvents, createEvent } from 'event'
import { Dialog, Button, Input } from 'components'
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
        <div id="title-edit"></div>
      </div>`

    dialogContent.appendChild(
      new Button({
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

    this.renderTitleEdit(document.querySelector('#title-edit') as Element)
  }

  private reset() {
    if (this.dialog) this.dialog.close()
  }

  private renderTitleEdit(titleEditContainer: Element) {
    const inputAndButtonContainer = document.createElement('div')
    const buttonContainer = document.createElement('div')
    buttonContainer.style.display = 'flex'
    buttonContainer.style.marginTop = '0.5em'

    const { inputContainer, button } = this.instantiateInputAndButton()

    buttonContainer.appendChild(button)
    inputAndButtonContainer.appendChild(inputContainer)
    inputAndButtonContainer.appendChild(buttonContainer)
    titleEditContainer.appendChild(inputAndButtonContainer)
  }

  private instantiateInputAndButton() {
    if (!this.note) throw new Error('Note not set')
    let inputValue = this.note.title

    const inputInstance = new Input({
      id: 'update-title',
      title: 'Update note title',
      placeholder: 'Note title',
      value: inputValue,
    })

    const input = inputInstance.getInput()

    const button = new Button({
      title: 'Update title',
      html: 'Update',
      disabled: this.note.title === inputValue,
      style: { marginRight: '0.5em' },
      onClick: () => {
        if (!inputValue) throw new Error('Unable to read input value')
        createEvent(NoteEvents.UpdateTitle, { title: inputValue }).dispatch()
      },
    }).getElement()

    // on input value change, update value and button disabled state
    input.addEventListener('input', (event) => {
      if (!this.note) throw new Error('Note not set')
      inputValue = (event.target as HTMLInputElement).value
      button.disabled = this.note.title === inputValue || !inputValue.trim()
    })

    return { inputContainer: inputInstance.getContainer(), button }
  }
}

const noteDeleteDialog = new NoteDeleteDialog()

export { noteDeleteDialog }
