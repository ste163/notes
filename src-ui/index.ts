/**
 * TODO PRIORITY ORDER
 *  - GetAll should only get the list of note meta data (everything but note content).
 *  - cleanup styling of the initial state so that there is a clean layout that doesn't re-adjust on first render
 *  - Add vitest + testing-library to test it.todos() and add error handling. The UI is too complex now to not have tests
 *     - Footer UI + handle error states related to db: show a new section in red with an icon and 'Error, view more' button
 *       - this will open the database modal (rename to be either Remote or Local). If not connected to a remote,
 *       - say that it is connected to local
 *    - (test this) Disable buttons when requests are in-flight (only for: save, create, delete, connect to db, disconnect) - use new events in the db class
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
 *   - Clean-up: Modal naming to Dialog for consistency (ARIA uses Dialog)
 * - BRANDING
 *  - make favicon
 *  - make icons for desktop
 */
import {
  LifeCycleEvents,
  KeyboardEvents,
  LoggerEvents,
  ModalEvents,
  DatabaseEvents,
  NoteEvents,
  createEvent,
} from 'event'
import { Database, useRemoteDetails } from 'database'
import { logContainerId, logger } from 'logger'
import { EditorStore, StatusStore } from 'store'
import {
  renderFooter,
  renderSidebarCreateNote,
  renderSidebarNoteList,
  renderRemoteDbLogs,
  renderNoteDetailsModal,
  renderRemoteDbSetupModal,
} from 'renderer/reactive'
import { renderEditor } from 'renderer/editor'
import type { Note } from 'types'

let database: Database

window.addEventListener(LifeCycleEvents.Init, async () => {
  try {
    // render base app layout with loading states
    renderSidebarCreateNote({ isSavingNote: false })
    renderSidebarNoteList({ isLoading: true, notes: {} })
    renderFooter()

    // setup database after app is rendering in loading state
    setupDatabase()
    const { id } = getUrlData()
    // these events set off the chain that renders the app
    createEvent(NoteEvents.GetAll).dispatch()
    createEvent(NoteEvents.Select, { _id: id }).dispatch()
  } catch (error) {
    logger('error', 'Error in LifeCycleEvents.Init.', error)
  }
})

/**
 * Note events for fetching, selecting, and CRUD operations
 */
window.addEventListener(NoteEvents.GetAll, async () => {
  try {
    renderSidebarNoteList({ isLoading: true, notes: {} })
    const notes = await database.getAll() // TODO: get all meta-data only instead of full note content (see PUT in db for notes)
    createEvent(NoteEvents.GotAll, { notes }).dispatch()
  } catch (error) {
    // TODO: render error in sidebarNoteList
    // TODO: WOULD BE NICE to have a custom eslint rule that does:
    // - if you are using console.error, say it's an error and say you need to use logger
    logger('error', 'Error fetching all notes', error)
  }
})

window.addEventListener(NoteEvents.GotAll, (event) => {
  const notes = (event as CustomEvent)?.detail?.notes
  const { id } = getUrlData()

  renderSidebarNoteList({ isLoading: false, notes })
  if (id)
    toggleActiveClass({
      selector: `#${id}-note-select-container`,
      type: NoteEvents.Select,
    })
})

window.addEventListener(NoteEvents.Select, async (event) => {
  const noteId = (event as CustomEvent)?.detail?._id ?? ''
  await renderNoteEditor({ isLoading: true, note: null })
  createEvent(NoteEvents.Selected, { _id: noteId }).dispatch()
})

/**
 * Selected that handles fetching and rendering of the main editor body
 */
window.addEventListener(NoteEvents.Selected, async (event) => {
  try {
    const noteId = (event as CustomEvent)?.detail?._id ?? ''
    const note = await database.getById(noteId)
    const { params } = getUrlData()

    // setup url routing based on the note
    note
      ? setUrl({ relativeUrl: `/${note?._id}`, params })
      : setUrl({ relativeUrl: '/', params })

    // update styling for the selected note in list
    toggleActiveClass({
      selector: `#${note?._id}-note-select-container`,
      type: NoteEvents.Select,
    })

    // TODO: revisit isDirty saving on a changed note event
    // if (EditorStore.isDirty) await saveNote(note)

    StatusStore.lastSavedDate = note?.updatedAt || null
    await renderNoteEditor({ isLoading: false, note })

    // based on URL params, render dialogs
    // note: this could potentially be moved to a `ModalEvents.Open` with which modal to render passed in
    switch (params?.dialog) {
      case 'details':
        note && renderNoteDetailsModal(note)
        break
      case 'database':
        renderRemoteDbSetupModal()
        break
      default:
        break
    }
  } catch (error) {
    // TODO: render error that selecting note failed (probably passing the error into the editor body)
    logger('error', 'Error selecting note.', error)
  }
})

window.addEventListener(NoteEvents.Create, async (event) => {
  const title = (event as CustomEvent)?.detail?.title
  try {
    // re-render the sidebar with loading state
    renderSidebarCreateNote({
      isSavingNote: true,
      title: title,
    })
    const _id = await database.put({ title, content: '' })
    createEvent(NoteEvents.Created, { _id }).dispatch()
  } catch (error) {
    // TODO: render error notification inside sidebarMenu
    renderSidebarCreateNote({
      isSavingNote: false,
      title: title,
      error: 'Error creating note',
    })
  }
})

window.addEventListener(NoteEvents.Created, async (event) => {
  renderSidebarCreateNote({ isSavingNote: false, error: '' })
  const _id = (event as CustomEvent)?.detail?._id
  createEvent(NoteEvents.Select, { _id }).dispatch()
  createEvent(NoteEvents.GetAll).dispatch()
})

window.addEventListener(NoteEvents.Save, async (event) => {
  try {
    // TODO: ensure the save button cannot be clicked until the promise completes
    const note = (event as CustomEvent)?.detail?.note as Note
    await database.put(note)
    createEvent(NoteEvents.Saved, { note }).dispatch()
  } catch (error) {
    logger('error', 'Error saving note.', error)
  }
})

window.addEventListener(NoteEvents.Saved, (event) => {
  // TODO: re-enable the save button (but will also need to track this so the user cannot spam super+s)
  const note = (event as CustomEvent)?.detail?.note as Note
  StatusStore.lastSavedDate = note?.updatedAt || null
  // ensure rest of state is updated
  createEvent(NoteEvents.GetAll).dispatch()
})

// TODO: also need to refactor details modal and state, along with adding error state and loading state
// for when we are editing the title
// TODO: pass the full noteToUpdate object with the new title
window.addEventListener(NoteEvents.EditTitle, async (event) => {
  try {
    const note = (event as CustomEvent)?.detail?.note as Note
    // TODO:
    // DISABLE the submit button
    // set state to LOADING
    await database.put(note)
    createEvent(NoteEvents.EditedTitle, { note }).dispatch()
  } catch (error) {
    // TODO: show error notification
    // re-enable the form
    console.error(error)
  }
})

window.addEventListener(NoteEvents.EditedTitle, (event) => {
  const note = (event as CustomEvent)?.detail?.note as Note

  // TODO: do not emit the .Select event again, but instead
  // re-render ONLY the open modal with the new state.
  // That way we re-trigger less rendering of the entire application, which is uneeded
  createEvent(NoteEvents.Select, { _id: note._id }).dispatch() // re-fetch full note data

  createEvent(NoteEvents.GetAll).dispatch() // re-fetch meta-data for list
})

window.addEventListener(NoteEvents.Delete, async (event) => {
  try {
    // TODO: disable delete button
    const note = (event as CustomEvent)?.detail?.note as Note
    await database.delete(note)
    createEvent(NoteEvents.Deleted, { note }).dispatch()
  } catch (error) {
    // TODO: if error, render the details modal with the error state
    // TODO: tests and error handling for details modal
    logger('error', 'Error deleting note.', error)
  }
})

window.addEventListener(NoteEvents.Deleted, (event) => {
  // TODO: consider logging info for all events like deleting and saving?
  const note = (event as CustomEvent)?.detail?.note as Note
  logger('info', `Note deleted: ${note.title}`)
  // TODO: re-enable the delete button? (but the modal will be closed, so probs not)

  // clear the url dialog param
  setUrl({ relativeUrl: `/${note._id}`, params: null })

  createEvent(ModalEvents.Close).dispatch()
  createEvent(NoteEvents.GetAll).dispatch()
  createEvent(NoteEvents.Select, { _id: '' }).dispatch()
})

/**
 * Remote database events
 */
window.addEventListener(DatabaseEvents.RemoteConnect, () => {
  if (StatusStore.isConnectedToRemote) {
    logger('info', 'Already connected to remote database.')
    return
  }
  setupDatabase()
  // the database emits the DatabaseEvents.RemoteConnected event if it successfully connects
})

window.addEventListener(DatabaseEvents.RemoteConnected, () => {
  if (StatusStore.isConnectedToRemote) return
  StatusStore.isConnectedToRemote = true
  database.setupSyncing()
  // TODO: so the syncing has been setup, but the currently selected note MAY be out-dated.
  // probably not an issue as couchDB is good at syncing, but potentially something that could be an issue
  createEvent(NoteEvents.GetAll).dispatch()
  // should we re-select the selected note?
  // we'd need to SAVE it before changing though
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
 * Modal events
 *
 * This are more specific to handling application state and less so on handling rendering
 */
window.addEventListener(ModalEvents.Open, (event) => {
  // Trap focus inside the modal, disable editor, and set URL params
  setTimeout(() => {
    // need timeout delay to allow modal to render
    const closeButton = document.querySelector('#modal-close') as HTMLElement
    closeButton?.focus()
  }, 10)

  const dialogTitle = (event as CustomEvent)?.detail?.param as string
  const { id } = getUrlData()
  setUrl({ relativeUrl: `/${id}`, params: { dialog: dialogTitle } })

  EditorStore.editor?.setEditable(false)
})

window.addEventListener(ModalEvents.Close, () => {
  // If there is a selected note, enable the editor after modal closes
  const { id } = getUrlData()
  if (id) EditorStore.editor?.setEditable(true)
  setUrl({ relativeUrl: `/${id}`, params: null })
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
  // TODO: note sure how to do this, as it will require the current note
  // which is currently not exposed state, but passed by events.
  // the keyboard does not have access to the current note, so it will need to fetch it from state.
  // this should actually trigger a fetch request, reading data from the URL, and pass the full data through
  // to the save event
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault() // prevent default save behavior
    // EditorStore.editor &&
    //   createEvent(NoteEvents.Save, {
    //     note: { content: EditorStore.editor.getHTML() },
    //   }).dispatch()
  }
})

/**
 * By this point, all events related to running the app have been created,
 * and the client is ready to be initialized
 */
window.addEventListener('DOMContentLoaded', async () => {
  dispatchEvent(new Event(LifeCycleEvents.Init))
})

/**
 * Renders the editor and updates store state
 * TODO: see if we can remove this function
 */
async function renderNoteEditor({
  isLoading,
  note,
}: {
  isLoading: boolean
  note: Note | null
}) {
  const editor = await renderEditor({ note, isLoading })
  if (editor) EditorStore.editor = editor
  if (!note) StatusStore.lastSavedDate = null
}

function setupDatabase() {
  try {
    const { username, password, host, port } = useRemoteDetails().get()
    database = new Database(
      username ? `http://${username}:${password}@${host}:${port}` : ''
    )
  } catch (error) {
    logger('error', 'Error setting up database.', error)
  }
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

function getUrlData() {
  const id = window.location.pathname.split('/')[1] ?? ''
  const searchParams = new URLSearchParams(window.location.search)
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  return {
    id,
    params,
  }
}

function setUrl({
  relativeUrl,
  params,
}: {
  relativeUrl?: string
  params?: Record<'dialog', string> | null
}) {
  try {
    const url = new URL(relativeUrl ?? '/', window.location.origin)
    url.search = params ? new URLSearchParams(params).toString() : ''
    window.history.replaceState({}, '', url.toString())
  } catch (error) {
    logger('error', 'Error setting URL.', error)
  }
}
