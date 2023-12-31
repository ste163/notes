/**
 * TODO PRIORITY ORDER
 * - REMOTE DB
 *   - setup the remote db that connects to the docker container
 *   - info about it in footer
 * - FEATURES
 *   - (placed in footer) auto-save toggle button with interval setting (most reliable way to save since I can't reliably intercept the close window event)
 *   - error notification (in footer)
 *   - mobile view (sidebar only + selected note only, state lives in URL)
 *   - BUG: tab order is broken for the floating menu if there is a checkbox in the editor
 * - BRANDING
 *  - make favicon
 *  - make icons for desktop
 */

import { Database } from 'database'
import { createEvent } from 'event'
import { NoteStore, EditorStore, StatusStore } from 'store'
import { renderBaseElements, renderGetStarted, renderEditor } from 'renderer'

let database: Database // not using a Store because the database is only used here

/**
 * Keyboard events
 */
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault() // prevent default save behavior
    EditorStore.editor &&
      createEvent('save-note', {
        note: { content: EditorStore.editor.getHTML() },
      }).dispatch()
  }
})

/**
 * App life-cycle events
 */
window.addEventListener('refresh-client', async () => {
  /**
   * Note on sorting:
   * by default it's by created_at,
   * but can easily be extended to sort by any note data
   */
  NoteStore.notes = await database.getAll()
  if (!NoteStore.selectedNoteId) {
    /**
     * To start, not calling the db again to get the most recent note.
     * However, if slow downs become noticeable, this would be a place to optimize.
     */
    const sortedNotes = Object.values(NoteStore.notes).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    NoteStore.selectedNoteId = sortedNotes[0]?._id
  }
  // reset global state
  EditorStore.isDirty = false

  await refreshClient()
})

window.addEventListener('create-note', async (event) => {
  try {
    const note = (event as CustomEvent)?.detail?.note
    const id = await database.put({ title: note.title, content: '' })
    NoteStore.selectedNoteId = id
    dispatchEvent(new Event('refresh-client'))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

window.addEventListener('save-note', async () => {
  try {
    await saveNote()
    dispatchEvent(new Event('refresh-client'))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

window.addEventListener('edit-note-title', async (event) => {
  try {
    const note = (event as CustomEvent)?.detail?.note
    const { title } = note
    if (!title || !NoteStore.selectedNoteId)
      throw new Error('Unable to edit note title')
    const noteToUpdate = NoteStore.notes[NoteStore.selectedNoteId]
    noteToUpdate.title = title
    await database.put(noteToUpdate)
    dispatchEvent(new Event('refresh-client'))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

window.addEventListener('delete-note', async () => {
  try {
    if (!NoteStore.selectedNoteId) throw new Error('No note selected to delete')
    const noteToDelete = NoteStore.notes[NoteStore.selectedNoteId]
    await database.delete(noteToDelete)
    NoteStore.selectedNoteId = null // reset selected note as it was deleted
    dispatchEvent(new Event('refresh-client'))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

window.addEventListener('select-note', async (event) => {
  try {
    if (EditorStore.isDirty) await saveNote()
    const note = (event as CustomEvent)?.detail?.note
    NoteStore.selectedNoteId = note.id
    dispatchEvent(new Event('refresh-client'))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

window.addEventListener('open-modal', () => {
  setTimeout(() => {
    // need timeout delay to allow modal to render
    const closeButton = document.querySelector('#modal-close') as HTMLElement
    closeButton?.focus()
  }, 10)
  EditorStore.editor?.setEditable(false)
})

window.addEventListener('close-modal', () => {
  EditorStore.editor?.setEditable(true)
})

/**
 * By this point, all events related to running the app have been created:
 * initial state has been setup, DOM has loaded, and
 * client is ready to render.
 */
window.addEventListener('DOMContentLoaded', async () => {
  try {
    database = new Database()
    dispatchEvent(new Event('refresh-client'))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

/**
 * Main app lifecycle, refresh based on latest state
 */
async function refreshClient(): Promise<void> {
  /**
   * Update state for initial render
   */
  if (NoteStore.selectedNoteId) {
    StatusStore.lastSavedDate =
      NoteStore.notes[NoteStore.selectedNoteId].updatedAt
  }
  const { editorElement, editorTopMenuElement, editorFloatingMenuElement } =
    renderBaseElements()

  // set main element content based on note state
  if (
    !Object.keys(NoteStore.notes).length ||
    !NoteStore.selectedNoteId ||
    !editorTopMenuElement
  ) {
    StatusStore.lastSavedDate = null
    renderGetStarted(editorElement)
    return
  }

  EditorStore.editor = await renderEditor({
    editorElement: editorElement,
    topEditorMenu: editorTopMenuElement,
    floatingEditorMenu: editorFloatingMenuElement,
    editorContent: NoteStore.notes[NoteStore.selectedNoteId]?.content,
  })

  // set which note in the list is active
  toggleActiveClass({
    selector: `#${NoteStore.selectedNoteId}-note-select-container`,
    type: 'select-note',
  })
}

async function saveNote() {
  if (!NoteStore.selectedNoteId || !EditorStore.editor)
    throw new Error('No note selected to save or no editor instance')
  const note = NoteStore.notes[NoteStore.selectedNoteId]
  const content = EditorStore.editor.getHTML()
  note.content = content
  await database.put(note)
}

function toggleActiveClass({
  selector,
  type,
}: {
  selector: string
  type: string
}) {
  try {
    const activeType = `${type}-active`
    // remove any active classes
    const elementsToClear = document.querySelectorAll(`.${activeType}`)
    elementsToClear?.forEach((element) => {
      element?.classList?.remove(activeType)
    })
    // assign activeType to selector
    const elementToActivate = document.querySelector(selector)
    elementToActivate?.classList.add(activeType)
  } catch (error) {
    console.error(error)
  }
}
