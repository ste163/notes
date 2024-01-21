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
import { EditorStore, StatusStore } from 'store'
import { renderGetStarted, renderEditor } from 'renderer'
import {
  renderFooter,
  renderSidebarTopMenu,
  renderSidebarNoteList,
  renderRemoteDbLogs,
} from 'renderer/reactive'
import type { Note } from 'types'

let database: Database // not using a Store because the database is only used here

window.addEventListener(LifeCycleEvents.Init, async () => {
  try {
    // render base app layout + state with loading on
    renderSidebarNoteList({ isLoading: true, notes: {} })
    renderSidebarTopMenu({ isLoading: true })
    renderSidebarTopMenu({ isLoading: false }) // TODO: remove isLoading from this fn
    renderFooter()

    setupDatabase()

    const noteIdFromUrl = window.location.pathname.split('/')[1] ?? ''

    createEvent(NoteEvents.GetAll).dispatch()
    createEvent(NoteEvents.Select, { _id: noteIdFromUrl }).dispatch()
  } catch (error) {
    logger('error', 'Error in LifeCycleEvents.Init.', error)
  }
})

window.addEventListener(NoteEvents.GetAll, async () => {
  try {
    renderSidebarNoteList({ isLoading: true, notes: {} })
    const notes = await database.getAll() // TODO: get all meta-data only instead of full note content (see PUT in db for notes)
    createEvent(NoteEvents.GotAll, { notes }).dispatch()
  } catch (error) {
    // TODO: WOULD BE NICE to have a custom eslint rule that does:
    // - if you are using console.error, say it's an error and say you need to use logger
    logger('error', 'Error fetching all notes', error)
  }
})

window.addEventListener(NoteEvents.GotAll, (event) => {
  const notes = (event as CustomEvent)?.detail?.notes
  renderSidebarNoteList({ isLoading: false, notes })
})

window.addEventListener(NoteEvents.Select, async (event) => {
  const noteId = (event as CustomEvent)?.detail?._id ?? ''
  await renderEditorBody({ isLoading: true, note: null })
  createEvent(NoteEvents.Selected, { _id: noteId }).dispatch()
})

window.addEventListener(NoteEvents.Selected, async (event) => {
  try {
    const noteId = (event as CustomEvent)?.detail?._id ?? ''
    const note = await database.getById(noteId)

    // update url state to the valid id, if available
    if (note) {
      window.history.pushState({}, '', `/${note?._id ?? noteId}`)
    } else {
      window.history.pushState({}, '', '/')
    }

    toggleActiveClass({
      selector: `#${note?._id}-note-select-container`,
      type: NoteEvents.Select,
    })

    // TODO: revisit isDirty saving on a changed note event
    // if (EditorStore.isDirty) await saveNote(note)

    StatusStore.lastSavedDate = note?.updatedAt || null

    await renderEditorBody({ isLoading: false, note })
  } catch (error) {
    logger('error', 'Error selecting note.', error)
  }
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
 * Note events
 */
// window.addEventListener(NoteEvents.Create, async (event) => {
//   try {
//     const note = (event as CustomEvent)?.detail?.note
//     const id = await database.put({ title: note.title, content: '' })
//     // createdEvent will select the newly created note and turn-off the loading state?
//   } catch (error) {
//     // TODO: show error notification
//     console.error(error)
//   }
// })

// window.addEventListener(NoteEvents.Save, async () => {
//   try {
//     // TODO GET FROM DETAIL
//     // await saveNote()
//     // TODO: dispatch note saved event
//   } catch (error) {
//     // TODO: show error notification
//     console.error(error)
//   }
// })

// TODO: pass the full noteToUpdate object with the new title
// window.addEventListener(NoteEvents.EditTitle, async (event) => {
//   try {
//     const note = (event as CustomEvent)?.detail?.note as Note
//     await database.put(note)
//   } catch (error) {
//     // TODO: show error notification
//     console.error(error)
//   }
// })

// TODO: pass the full note object
// window.addEventListener(NoteEvents.Delete, async () => {
//   try {
//     if (!NoteStore.selectedNoteId) throw new Error('No note selected to delete')
//     const noteToDelete = NoteStore.notes[NoteStore.selectedNoteId]
//     await database.delete(noteToDelete)
//     NoteStore.selectedNoteId = null // reset selected note as it was deleted
//   } catch (error) {
//     // TODO: show error notification
//     console.error(error)
//   }
// })

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
  dispatchEvent(new Event(LifeCycleEvents.Init))
})

/**
 * Decide whether to render the get started page or the editor
 * TODO: might be best to make the Get started page be the default render content
 * that is still edit-able, but you can't save it. That way the app state is always initialized in at least some way?
 */
async function renderEditorBody({
  isLoading,
  note,
}: {
  isLoading: boolean
  note: Note | null
}) {
  const container = document.querySelector('#editor')
  if (!container) throw new Error('Unable to find editor container')

  if (isLoading) {
    container.innerHTML = 'Loading...'
    return
  }

  if (!note?._id) {
    StatusStore.lastSavedDate = null
    renderGetStarted(container)
    return
  }

  // TODO: pass the note content in
  EditorStore.editor = await renderEditor({
    content: note.content,
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

// async function saveNote(note: Note) {
//   if (!EditorStore.editor) throw new Error('No editor to save')
//   const noteToSave = { ...note }
//   const content = EditorStore.editor.getHTML()
//   noteToSave.content = content
//   await database.put(note)
// }

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
