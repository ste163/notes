/**
 * TODO PRIORITY ORDER
 *  - DATABASE DIALOG FORM:
 *     - Must have a way to STOP a connection attempt: cancel button in the status section
 *     - Disable the submit button UNTIL all inputs are filled.
 *       Need to disable the submit if the full form hasn't been entered
 *       on CHANGE not just initial. If the form has been changed, updated
 *       the button copy from Reconnect to Connect (as it has changed)
 *
 *  - sidebar state should live in nav bar as a '?sidebar-open=true' query param
 *      - also add the e2e around this
 *  - title edit
 *      - on hover show edit icon (pencil?) = new functionality
 *      - ENTER press saves when input is open (calls onBlur function)
 *  - (?) add a warning banner for web-only builds that says:
 *      "Running: web version. This is version is for demo purposes only. Please download
 *       the application for the best experience."
 *    - move all console.logs and console.errors to the logger()
 *      so that all interactions with the database are logged
 *      - fetches, errors, saves, deletes, etc.
 *      - if possible, add eslint rule to enforce this
 *    - include the Remix icons apache license AND pouchdb AND tauri in the repo and as a 'legal/about' button (or i icon next to the version number) that renders a dialog in the statusBar
 *      - could include info about the application, its version, its license and the remix icon license
 * - FEATURES
 *   - auto-save at debounced interval
 *   - sidebar is resizable and saves to localStorage, loading on refresh
 *   - hyperlinks in the editor
 *   - save cursor position to the note object so we can re-open at the correct location
 *   - add hyperlink insert support
 *   - MOBILE ONLY: instead of hiding editor buttons, hide them under an ellipsis pop-out menu
 *   - resize-able sidebar that saves and loads its state to localStorage
 *   - e2e:
 *    - if it's main branch, use production link (new action?)
 *    - otherwise, build environment and use that (what's currently setup)
 * - BRANDING
 *   - make favicon
 *   - make icons for desktop
 * - BUGS (which also need tests)
 *    - on the initial fresh load, the get fails because of no default index. All re-renders/refreshes work
 *    - if a note id is present in the URL, but not in the database, the editor is ACTIVATED!!! It must be disabled
 *    - if unable to find data, need to be able to delete the undefined notes
 * - Add test reports for unit and e2e to readme
 *  - DATABASE INTERACTIONS
 *     Thoroughly manually test db scenarios:
 *
 *     I have been connected to DB A and synced locally.
 *     I connected to DB B, what happens?
 *     Hypothesis: the local becomes synced to both (unless there are conflicts)
 *
 *     I delete data on my local and not the remote.
 *     Does it stay deleted? (Accidental deletions?)
 *
 *
 */
import { database } from 'database'
import {
  LifeCycleEvents,
  KeyboardEvents,
  LoggerEvents,
  DialogEvents,
  DatabaseEvents,
  NoteEvents,
  createEvent,
} from 'event'
import {
  sidebar,
  statusBar,
  editor,
  databaseDialog,
  noteDeleteDialog,
} from 'renderer/reactive'
import { AppNotification } from 'components'
import { urlController } from 'url-controller'
import { checkIcon } from 'icons'
import { logger } from 'logger'
import type { Note } from 'types'

let isMobile: boolean

window.addEventListener(LifeCycleEvents.Init, async () => {
  try {
    database.initRemoteConnection() // must not await or it locks UI

    sidebar.render()
    statusBar.render()
    statusBar.renderRemoteDb({ isConnected: false })
    statusBar.renderActiveNote(null)

    handleScreenWidth()

    const { noteId, dialog, sidebar: sidebarParam } = urlController.getParams()

    sidebarParam
      ? createEvent(LifeCycleEvents.QueryParamUpdate, {
          sidebar: sidebarParam,
        }).dispatch()
      : createEvent(LifeCycleEvents.QueryParamUpdate, {
          sidebar: 'open',
        }).dispatch()

    if (!noteId) {
      editor.setDisabled(true)
      editor.setNote(null)
    }

    noteId
      ? createEvent(LifeCycleEvents.QueryParamUpdate, { noteId }).dispatch()
      : createEvent(NoteEvents.GetAll).dispatch()

    if (dialog)
      createEvent(LifeCycleEvents.QueryParamUpdate, { dialog }).dispatch()
  } catch (error) {
    logger.log('Error in LifeCycleEvents.Init.', 'error', error)
  }
})

/**
 * URL Update event that handles rendering and state
 * based on query params
 */
window.addEventListener(LifeCycleEvents.QueryParamUpdate, async (event) => {
  const noteId: string = (event as CustomEvent)?.detail?.noteId
  const dialog: string = (event as CustomEvent)?.detail?.dialog
  const sidebarParam: string = (event as CustomEvent)?.detail?.sidebar

  if (sidebarParam) {
    const openSidebar = () => {
      isMobile ? setMobileView() : setDesktopView()
      statusBar.setSidebarButtonActive(true)
      sidebar.open()
    }

    const closeSidebar = () => {
      setDesktopView()
      statusBar.setSidebarButtonActive(false)
      sidebar.close()
    }

    urlController.setParam('sidebar', sidebarParam)
    sidebarParam === 'open' ? openSidebar() : closeSidebar()
  }

  if (noteId) {
    if (editor.getIsDirty()) await saveNote()
    urlController.setParam('noteId', noteId)
    createEvent(NoteEvents.Select, { _id: noteId }).dispatch()
    createEvent(NoteEvents.GetAll).dispatch()
  }

  if (noteId === null) {
    urlController.removeParam('noteId')
    createEvent(LifeCycleEvents.NoNoteSelected).dispatch()
  }

  if (dialog) {
    const { noteId } = urlController.getParams()
    urlController.setParam('dialog', dialog)

    const openDeleteDialog = async () => {
      const { noteId } = urlController.getParams()
      if (!noteId) return
      const note = await database.getById(noteId)
      if (note) noteDeleteDialog.render(note)
    }

    // TODO: use consts from dialog class
    // use an object instead of switch
    switch (dialog) {
      case 'delete':
        noteId && (await openDeleteDialog())
        break
      case 'database':
        databaseDialog.render()
        break
      default:
        break
    }
  }

  if (dialog === null) {
    urlController.removeParam('dialog')
    noteDeleteDialog.clear()
    databaseDialog.clear()
    // close dialog event only calls to update the url
    // because dialog events need to be handled uniquely
    // due to needing to cleanup the specific instance of the event
  }
})

window.addEventListener(LifeCycleEvents.NoNoteSelected, () => {
  editor.setNote(null)
  statusBar.renderActiveNote(null)
  createEvent(NoteEvents.GetAll).dispatch()
})

window.addEventListener('resize', handleScreenWidth)

window.addEventListener(LifeCycleEvents.WidthChanged, () => {
  if (isMobile) {
    setMobileView()
    createEvent(LifeCycleEvents.QueryParamUpdate, {
      sidebar: 'open',
    }).dispatch()
  } else setDesktopView()
})

window.addEventListener(LifeCycleEvents.ShowSaveNotification, () => {
  const notification = new AppNotification({
    id: 'note-saved',
    testId: 'save-notification',
    icon: checkIcon,
    text: `Saved`,
  })
  notification.show()
  setTimeout(() => {
    notification.remove()
  }, 2000)
})

/**
 * Note events for fetching, selecting, and CRUD operations
 */
window.addEventListener(NoteEvents.GetAll, async () => {
  try {
    const notes = await database.getAll()
    const { noteId } = urlController.getParams()
    // TODO: if no notes, then emit a new event
    // to handle that state so that we can reset the UI
    // TODO: only renderNoteList if there are notes
    // OR, we have a more generic method for supplying updated notes
    // to the note list
    sidebar.renderNoteList(notes)
    if (noteId) sidebar.setActiveNote(noteId)
  } catch (error) {
    // TODO: WOULD BE NICE to have a custom eslint rule that does:
    // - if you are using console.error, say it's an error and say you need to use logger
    logger.log('Error fetching all notes', 'error', error)
  }
})

window.addEventListener(NoteEvents.Select, async (event) => {
  try {
    const eventNoteId: string = (event as CustomEvent)?.detail?._id

    // TODO: this can probably be removed, at least the event dispatch
    // URL event is handling this
    if (!eventNoteId) {
      createEvent(LifeCycleEvents.NoNoteSelected).dispatch()
      return
    }

    const note = await database.getById(eventNoteId)
    if (isMobile)
      createEvent(LifeCycleEvents.QueryParamUpdate, {
        sidebar: 'close',
      }).dispatch()

    if (note) {
      sidebar.setActiveNote(note?._id)
      statusBar.renderSavedOn(new Date(note?.updatedAt).toLocaleString())
    }

    statusBar.renderActiveNote(note)
    editor.setNote(note)
    editor.setCursorPosition('start')

    createEvent(NoteEvents.GetAll).dispatch()
  } catch (error) {
    logger.log('Error selecting note.', 'error', error)
  }
})

window.addEventListener(NoteEvents.Create, async (event) => {
  const title = (event as CustomEvent)?.detail?.title
  try {
    const { _id } = await database.put({ title, content: '' })
    sidebar.closeInput()
    createEvent(LifeCycleEvents.QueryParamUpdate, { noteId: _id }).dispatch()
  } catch (error) {
    logger.log('Error creating note.', 'error', error)
  }
})

window.addEventListener(NoteEvents.Save, async () => {
  try {
    const { updatedAt } = await saveNote()
    statusBar.renderSavedOn(new Date(updatedAt ?? '').toLocaleString())
    createEvent(NoteEvents.GetAll).dispatch() // updates rest of state
    createEvent(LifeCycleEvents.ShowSaveNotification).dispatch()
  } catch (error) {
    logger.log('Error saving note.', 'error', error)
  }
})

window.addEventListener(NoteEvents.UpdateTitle, async (event) => {
  try {
    const title = (event as CustomEvent)?.detail?.title
    const note = await fetchNoteFromUrl()
    const updatedNote = { ...note, title, content: editor.getContent() }
    const { updatedAt } = await database.put({
      ...updatedNote,
    })

    statusBar.renderSavedOn(new Date(updatedAt ?? '').toLocaleString())
    statusBar.renderActiveNote(updatedNote)
    editor.setNote({ ...updatedNote, updatedAt })
    createEvent(NoteEvents.GetAll).dispatch()
    createEvent(LifeCycleEvents.ShowSaveNotification).dispatch()
  } catch (error) {
    logger.log('Error updating note title.', 'error', error)
  }
})

window.addEventListener(NoteEvents.Delete, async (event) => {
  try {
    const note = (event as CustomEvent)?.detail?.note as Note
    await database.delete(note)
    logger.log(`Note deleted: ${note.title}`, 'info')
    createEvent(LifeCycleEvents.QueryParamUpdate, {
      noteId: null,
    }).dispatch()
    // specially handling for closing this dialog
    // as the dialog close event handles the URL update
    noteDeleteDialog.close()
  } catch (error) {
    logger.log('Error deleting note.', 'error', error)
  }
})

/**
 * Remote database events
 */
window.addEventListener(DatabaseEvents.Setup, () => {
  database.restartConnection()
})

window.addEventListener(DatabaseEvents.Connecting, () => {
  statusBar.renderRemoteDb({ isConnected: false, isConnecting: true })
  databaseDialog.setIsConnecting(true)
})

window.addEventListener(DatabaseEvents.ConnectingError, () => {
  // TODO: consider after testing: should probably update text to say "Unable to connect"
  statusBar.renderRemoteDb({ isConnected: false, isConnecting: false })
  databaseDialog.setIsConnecting(false)
})

window.addEventListener(DatabaseEvents.Connected, () => {
  statusBar.renderRemoteDb({ isConnected: true })
  databaseDialog.setIsConnecting(false)
  databaseDialog.setIsConnected(true)

  // TODO: so the syncing has been setup, but the currently selected note MAY be out-dated.
  // probably not an issue as couchDB is good at syncing, but potentially something that could be an issue
  createEvent(NoteEvents.GetAll).dispatch()
  // should we re-select the selected note?
  // we'd need to SAVE it before changing though
})

window.addEventListener(DatabaseEvents.Disconnect, () => {
  const successfulDisconnect = database.disconnectSyncing()
  if (successfulDisconnect) {
    statusBar.renderRemoteDb({ isConnected: false })
    databaseDialog.setIsConnected(false)
  }
})

window.addEventListener(DatabaseEvents.SyncingPaused, (event) => {
  const date = (event as CustomEvent)?.detail?.date
  statusBar.renderSyncedOn(new Date(date).toLocaleString())
  databaseDialog.setSyncedOn(new Date(date).toLocaleString())
  // TODO:
  // this also needs to be stored in local storage
  // so that we can render that on the chance that we are unable to connect
  // to the remote, we can still render when the last time was we did successfully connect
})

/**
 * Dialog events
 *
 * These are split between handling the entire application state for
 * any dialogs and for rendering specific dialogs.
 *
 */
window.addEventListener(DialogEvents.Opened, (event) => {
  const focusDialog = () => {
    // because there is not a singleton dialog, find first for now.
    // The dialog component supports 'n' amount, but the app only uses one at a time
    const dialog = document.querySelectorAll('[role="dialog"]')[0]
    ;(dialog as HTMLElement)?.focus()
  }

  setTimeout(
    focusDialog,
    100 // need timeout delay to allow dialog to render
  )

  const dialogTitle = (event as CustomEvent)?.detail?.dialog as string
  // TODO: dialog titles need to be a const so I can do safer checks; should come from the dialog Class
  if (dialogTitle === 'database') statusBar.renderAlert('') // clear the statusBar's alert state
  editor.setDisabled(true)
})

window.addEventListener(DialogEvents.Closed, () => {
  editor.setDisabled(false)
})

/**
 * Log events
 */
window.addEventListener(LoggerEvents.Update, (event) => {
  const detail = (event as CustomEvent)?.detail

  if (!detail.log || !detail.type)
    throw new Error('Log update event does not contain data.')

  const { log, type } = detail

  if (type === 'info') {
    statusBar.renderAlert(null)
    databaseDialog.setError(null)
  }

  if (type === 'error') {
    statusBar.renderAlert(log)
    databaseDialog.setError(log)
  }
})

/**
 * Keyboard events
 */
document.addEventListener(KeyboardEvents.Keydown, (event) => {
  // TODO: the create input ESC click to close lives in its component
  // as opposed to here. Consider consolidating

  // TODO: note sure how to do this, as it will require the current note
  // which is currently not exposed state, but passed by events.
  // the keyboard does not have access to the current note, so it will need to fetch it from state.
  // this should actually trigger a fetch request, reading data from the URL, and pass the full data through
  // to the save event
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault() // prevent default save behavior
    createEvent(NoteEvents.Save).dispatch()
  }
})

/**
 * By this point, all events related to running the app have been created,
 * and the client is ready to be initialized
 */
window.addEventListener('DOMContentLoaded', async () => {
  dispatchEvent(new Event(LifeCycleEvents.Init))
})

async function saveNote() {
  const note = await fetchNoteFromUrl()
  const content = editor.getContent()
  const { updatedAt } = await database.put({
    ...note,
    content,
  })
  return {
    ...note,
    content,
    updatedAt,
  }
}

function setDesktopView() {
  sidebar.toggleFullscreen(false)
  toggleEditorVisibility(true)
}

function setMobileView() {
  sidebar.toggleFullscreen(true)
  toggleEditorVisibility(false)
}

function toggleEditorVisibility(isVisible: boolean) {
  const body = document.body
  const mainElement = document.querySelector('#main') as HTMLElement
  if (isVisible) {
    mainElement.style.display = 'flex'
    body.classList.remove('body-invisible')
    body.classList.add('body-visible')
  } else {
    mainElement.style.display = 'none'
    body.classList.remove('body-visible')
    body.classList.add('body-invisible')
  }
}

function handleScreenWidth() {
  const width = window.innerWidth
  const previousIsMobile = isMobile
  isMobile = width < 640
  if (previousIsMobile !== isMobile)
    dispatchEvent(new Event(LifeCycleEvents.WidthChanged))
}

async function fetchNoteFromUrl() {
  const { noteId } = urlController.getParams()
  if (!noteId) throw new Error('No note selected.')
  const note = await database.getById(noteId)
  if (!note) throw new Error('No note found.')
  return note
}
