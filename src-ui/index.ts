/**
 * TODO PRIORITY ORDER
 *  - Rendering refactor: event-based instead of a 'main refresh loop'.
 *    - Components only render data from the event that fetches the data and passes it into the components
 *    - This will simplify the main loop and make adding features easier. Potentially will also allow for the removal of state management
 *    - as the passing of data will be handled by the events
 *    - Potential structure: renderer/reactive (all state-rendered items), renderer/static (static layout), renderer/components (base components, not used outside the renderer)
 *      - RELATED TODOs:
 *        - Revisit fetch requests. GetAll should only get the list of note meta data. Get by Id gets all note details + content
 *        - URL param state for: selected note id
 *     - Footer UI + handle error states related to db: show a new section in red with an icon and 'Error, view more' button
 *       - this will open the database modal (rename to be either Remote or Local). If not connected to a remote,
 *       - say that it is connected to local
 *    - Disable buttons when requests are in-flight (only for: save, create, delete, connect to db, disconnect) - use new events in the db class
 *    - loading states to stop the flashing on screen when connecting after a disconnect
 *    - move all console.logs and console.errors to the logger() - include state updates. We want to log all db interactions
 *      - fetches, errors, saves, deletes, etc.
 *    - include the Remix icons apache license AND pouchdb AND tauri in the repo and as a 'legal/about' button (or i icon next to the version number) that renders a modal in the footer
 *      - could include info about the application, its version, its license and the remix icon license
 *     - BUG: fix database modal error styling. Icon shrinks
 *     - BUG: if there is an error when connecting to the db on initial startup, we're not logging that error in the UI
 *             - the error also gets triggered/logged before vite connects (in the logs)
 * - FEATURES
 *   - (placed in footer) auto-save toggle button with interval setting (most reliable way to save since I can't reliably intercept the close window event)
 *   - hyperlinks in the editor
 *   - mobile view (sidebar only + selected note only, state lives in URL)
 *   - BUG: tab order is broken for the floating menu if there is a checkbox in the editor
 * - BRANDING
 *  - make favicon
 *  - make icons for desktop
 */
import { Database, useRemoteDetails } from 'database'
import { logContainerId, logger } from 'logger'
import {
  LifeCycleEvents,
  KeyboardEvents,
  LoggerEvents,
  ModalEvents,
  DatabaseEvents,
  NoteEvents,
  createEvent,
} from 'event'
import { NoteStore, EditorStore, StatusStore } from 'store'
import {
  renderBaseElements,
  renderGetStarted,
  renderEditor,
  renderRemoteDbLogs,
} from 'renderer'

let database: Database // not using a Store because the database is only used here

/**
 * Keyboard events
 */
document.addEventListener(KeyboardEvents.Keydown, (event) => {
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
window.addEventListener(LifeCycleEvents.Refresh, async () => {
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
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    NoteStore.selectedNoteId = sortedNotes[0]?._id
  }
  // reset global state
  EditorStore.isDirty = false

  await refreshClient()
})

/**
 * Remote database events
 */
window.addEventListener(DatabaseEvents.RemoteConnected, () => {
  if (StatusStore.isConnectedToRemote) return
  StatusStore.isConnectedToRemote = true
  database.setupSyncing()
})

window.addEventListener(DatabaseEvents.RemoteConnect, () => {
  if (StatusStore.isConnectedToRemote) {
    logger('info', 'Already connected to remote database.')
    return
  }
  setupDatabase()
})

window.addEventListener(DatabaseEvents.RemoteDisconnect, () => {
  if (!StatusStore.isConnectedToRemote) {
    logger('info', 'Already disconnected from remote database.')
    return
  }
  const successfulDisconnect = database.disconnectSyncing()
  if (successfulDisconnect) StatusStore.isConnectedToRemote = false
  // TODO: need to clear the remote details from local storage
  // so we do not reconnect on refresh
})

window.addEventListener(DatabaseEvents.RemoteSyncingPaused, (event) => {
  const date = (event as CustomEvent)?.detail?.date
  StatusStore.lastSyncedDate = date
  // TODO:
  // this also needs to be stored in local storage
  // so that we can render that on the chance that we are unable to connect
  // to the remote, we can still render when the last time was we did successfully connect
})

/**
 * Log events
 */
window.addEventListener(LoggerEvents.Update, (event) => {
  const logs = (event as CustomEvent)?.detail?.logs
  const dbLogContainer = document.querySelector(logContainerId)
  if (dbLogContainer) renderRemoteDbLogs(dbLogContainer, logs)
})

/**
 * Note events
 */
window.addEventListener(NoteEvents.Create, async (event) => {
  try {
    const note = (event as CustomEvent)?.detail?.note
    const id = await database.put({ title: note.title, content: '' })
    NoteStore.selectedNoteId = id
    dispatchEvent(new Event(LifeCycleEvents.Refresh))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

window.addEventListener(NoteEvents.Save, async () => {
  try {
    await saveNote()
    dispatchEvent(new Event(LifeCycleEvents.Refresh))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

window.addEventListener(NoteEvents.EditTitle, async (event) => {
  try {
    const note = (event as CustomEvent)?.detail?.note
    const { title } = note
    if (!title || !NoteStore.selectedNoteId)
      throw new Error('Unable to edit note title')
    const noteToUpdate = NoteStore.notes[NoteStore.selectedNoteId]
    noteToUpdate.title = title
    await database.put(noteToUpdate)
    dispatchEvent(new Event(LifeCycleEvents.Refresh))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

window.addEventListener(NoteEvents.Delete, async () => {
  try {
    if (!NoteStore.selectedNoteId) throw new Error('No note selected to delete')
    const noteToDelete = NoteStore.notes[NoteStore.selectedNoteId]
    await database.delete(noteToDelete)
    NoteStore.selectedNoteId = null // reset selected note as it was deleted
    dispatchEvent(new Event(LifeCycleEvents.Refresh))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

window.addEventListener(NoteEvents.Select, async (event) => {
  try {
    if (EditorStore.isDirty) await saveNote()
    const note = (event as CustomEvent)?.detail?.note
    NoteStore.selectedNoteId = note.id
    dispatchEvent(new Event(LifeCycleEvents.Refresh))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

/**
 * Modal events
 */
window.addEventListener(ModalEvents.Open, () => {
  setTimeout(() => {
    // need timeout delay to allow modal to render
    const closeButton = document.querySelector('#modal-close') as HTMLElement
    closeButton?.focus()
  }, 10)
  EditorStore.editor?.setEditable(false)
})

window.addEventListener(ModalEvents.Close, () => {
  EditorStore.editor?.setEditable(true)
})

/**
 * By this point, all events related to running the app have been created:
 * initial state has been setup, DOM has loaded, and
 * client is ready to render.
 */
window.addEventListener('DOMContentLoaded', async () => {
  setupDatabase()
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
    type: NoteEvents.Select,
  })
}

function setupDatabase() {
  try {
    const { username, password, host, port } = useRemoteDetails().get()
    database = new Database(`http://${username}:${password}@${host}:${port}`)
    dispatchEvent(new Event(LifeCycleEvents.Refresh))
  } catch (error) {
    // TODO: show error notification
    logger('error', 'Error setting up database.', error)
  }
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
