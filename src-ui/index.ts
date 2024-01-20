/**
 * TODO PRIORITY ORDER
 *  - Rendering refactor: event-based instead of a 'main refresh loop'.
 *    - Components only render data from the event that fetches the data and passes it into the components
 *    - This will simplify the main loop and make adding features easier. Potentially will also allow for the removal of state management
 *    - as the passing of data will be handled by the events
 *    - Potential structure: renderer/reactive (all state-rendered items), renderer/static (static layout), renderer/components (base components, not used outside the renderer)
 *      - RELATED TODOs:
 *        - Revisit fetch requests. GetAll should only get the list of note meta data. Get by Id gets all note details + content
 *     - Footer UI + handle error states related to db: show a new section in red with an icon and 'Error, view more' button
 *       - this will open the database modal (rename to be either Remote or Local). If not connected to a remote,
 *       - say that it is connected to local
 *    - Disable buttons when requests are in-flight (only for: save, create, delete, connect to db, disconnect) - use new events in the db class
 *    - loading states to stop the flashing on screen when connecting after a disconnect
 *    - move all console.logs and console.errors to the logger() - include state updates. We want to log all db interactions
 *      - fetches, errors, saves, deletes, etc.
 *    - include the Remix icons apache license AND pouchdb AND tauri in the repo and as a 'legal/about' button (or i icon next to the version number) that renders a modal in the footer
 *      - could include info about the application, its version, its license and the remix icon license
 *    - move all Icons into the const as it will make the main files smaller and easier to read
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
import { renderGetStarted, renderEditor } from 'renderer'
import {
  renderFooter,
  renderSidebarTopMenu,
  renderSidebarNoteList,
  renderRemoteDbLogs,
} from 'renderer/reactive'

let database: Database // not using a Store because the database is only used here

/**
 * App life-cycle events
 */
window.addEventListener(LifeCycleEvents.Init, async () => {
  /**
   * Initial application state after the database has been setup.
   * Everything required for running the application at later stages
   */

  // TODO: this is when the main application loading state is still true (which it defaults to)
  // until the FetchAllNotes completes
  const noteIdFromUrl = window.location.pathname.split('/')[1]
  if (noteIdFromUrl && NoteStore.notes[noteIdFromUrl]) {
    NoteStore.selectedNoteId = noteIdFromUrl
  } else {
    // set url to '/' to remove bad link
    window.history.pushState({}, '', '/')
  }

  // TODO: better handling on resetting the editor.isDirty state
  // should only happen after a save event
  // EditorStore.isDirty = false
  await initClient()

  // TODO: check the URL, and see if there is any id
  // if there is, fetch by id at this point to queue up the event
  createEvent(LifeCycleEvents.FetchAllNotes).dispatch()
})

window.addEventListener(LifeCycleEvents.FetchAllNotes, async () => {
  // TODO: loading state = TRUE which will need to render the sidebar loading state
  // this can be tapped-into the store so it's always handled there?
  try {
    const notes = await database.getAll()
    createEvent(LifeCycleEvents.FetchedAllNotes, { notes }).dispatch()
  } catch (error) {
    // TODO: WOULD BE NICE to have a custom eslint rule that does:
    // - if you are using console.error, say it's an error and say you need to use logger
    logger('error', 'Error fetching all notes', error)
  }
})

window.addEventListener(LifeCycleEvents.FetchedAllNotes, (event) => {
  const notes = (event as CustomEvent)?.detail?.notes
  NoteStore.notes = notes
  const container = document.querySelector('#sidebar-list')
  // isLoading = false for the sidebar
  if (container) renderSidebarNoteList({ container, notes })
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
  dispatchEvent(new Event(LifeCycleEvents.Init))
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
 * Note events
 */
window.addEventListener(NoteEvents.Create, async (event) => {
  try {
    const note = (event as CustomEvent)?.detail?.note
    const id = await database.put({ title: note.title, content: '' })
    NoteStore.selectedNoteId = id
    // TODO: dispatch note created event instead of .init
    dispatchEvent(new Event(LifeCycleEvents.Init))
  } catch (error) {
    // TODO: show error notification
    console.error(error)
  }
})

window.addEventListener(NoteEvents.Save, async () => {
  try {
    await saveNote()
    // TODO: dispatch note saved event instead of .init
    dispatchEvent(new Event(LifeCycleEvents.Init))
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
    dispatchEvent(new Event(LifeCycleEvents.Init))
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
    dispatchEvent(new Event(LifeCycleEvents.Init))
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

    // TODO: dispatch SelectedNoteEvent
    dispatchEvent(new Event(LifeCycleEvents.Init))
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
 * Log events
 */
window.addEventListener(LoggerEvents.Update, (event) => {
  const logs = (event as CustomEvent)?.detail?.logs
  const dbLogContainer = document.querySelector(logContainerId)
  if (dbLogContainer) renderRemoteDbLogs(dbLogContainer, logs)
})

/**
 * Keyboard events
 */
document.addEventListener(KeyboardEvents.Keydown, (event) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault() // prevent default save behavior
    EditorStore.editor &&
      createEvent(NoteEvents.Save, {
        note: { content: EditorStore.editor.getHTML() },
      }).dispatch()
  }
})

/**
 * By this point, all events related to running the app have been created:
 * initial state has been setup, DOM has loaded, and
 * client is ready to render.
 *
 * Setup initial database connecting and application rendering
 */
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // TODO: skeleton screen UI of the entire application: no data state

    //

    // LOAD the initial layout and components but with all in a loading skeleton state
    // then conditionally render in elements as their data gets loaded
    // - fetch all notes: sidebar renders
    // - if there is an id in the url, fetch by id
    setupDatabase()
    dispatchEvent(new Event(LifeCycleEvents.Init))
  } catch (error) {
    logger('error', 'Error in initial setup of DOMContentLoaded.', error)
  }
})

/**
 * TODO: this will be fully removed and moved to individual events
 * Main app lifecycle, refresh based on latest state
 */
async function initClient(): Promise<void> {
  /**
   * TODO: will remove this piece as it will be based on events
   * Update state for initial render
   */
  if (NoteStore.selectedNoteId) {
    StatusStore.lastSavedDate =
      NoteStore.notes[NoteStore.selectedNoteId].updatedAt
  }

  const sidebarTopMenuElement = document.querySelector('#sidebar-top-menu')
  const footerElement = document.querySelector('footer')

  if (sidebarTopMenuElement) renderSidebarTopMenu(sidebarTopMenuElement)
  if (footerElement) renderFooter(footerElement)

  // no notes or on the '/' home route
  if (!Object.keys(NoteStore.notes).length || !NoteStore.selectedNoteId) {
    StatusStore.lastSavedDate = null
    const editorElement = document.querySelector('#editor')
    if (editorElement) renderGetStarted(editorElement)
    return
  }

  EditorStore.editor = await renderEditor({
    content: NoteStore.notes[NoteStore.selectedNoteId]?.content,
  })

  // TODO:
  // this only runs on a selectNoteEvent
  toggleActiveClass({
    selector: `#${NoteStore.selectedNoteId}-note-select-container`,
    type: NoteEvents.Select,
  })
}

function setupDatabase() {
  try {
    const { username, password, host, port } = useRemoteDetails().get()
    database = new Database(`http://${username}:${password}@${host}:${port}`)
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
