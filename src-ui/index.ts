/**
 * TODO PRIORITY ORDER
 *  - DATABASE DIALOG FORM: disable the submit button UNTIL all inputs are filled
 *  - Database refactor into a single class instance like other components
 *  - Attempting connection: need a way to STOP the attempt and re-attempt. It's not obvious if you can now
 *      or how it works as the UI doesn't respond to it
 *  - Update error logging types to know how to re-render state in db dialog
 *  - Database connection form MUST be disabled fully while connecting, reconnecting, disconnecting
 *  - Database dialog should show the last synced date if we're connected
 *  - sidebar state should live in nav bar as a '?sidebar-open=true' query param
 *  - delete dialog styling refresh (it's only functional now)
 *  - title edit
 *      - on hover show edit icon (pencil?) = new functionality
 *      - ENTER press saves when input is open (calls onBlur function)
 *  - (?)add a warning banner for web-only builds that says:
 *      "Running: web version. This is version is for demo purposes only. Please download
 *       the application for the best experience."
 *    - move all console.logs and console.errors to the logger() - include state updates. We want to log all db interactions
 *      - fetches, errors, saves, deletes, etc.
 *      - if possible, add eslint rule to enforce this
 *    - include the Remix icons apache license AND pouchdb AND tauri in the repo and as a 'legal/about' button (or i icon next to the version number) that renders a dialog in the statusBar
 *      - could include info about the application, its version, its license and the remix icon license
 * - FEATURES
 *   - auto-save at debounced interval
 *   - db dialog: showing if connected to local only or remote
 *   - hyperlinks in the editor
 *   - save cursor position to the note object so we can re-open at the correct location
 *   - db dialog needs to have last synced date (for mobile parity)
 *   - add hyperlink insert support
 *   - MOBILE ONLY: instead of hiding editor buttons, hide them under an ellipsis pop-out menu
 *   - resize-able sidebar that saves and loads its state to localStorage
 * - BRANDING
 *   - make favicon
 *   - make icons for desktop
 * - BUGS
 *    - if a note id is present in the URL, but not in the database, the editor is ACTIVATED!!! It must be disabled
 *    - if note is deleted (ie, none selected, emit a an event to set ui to a non-selected state/get-started state)
 *    - if there is an error when connecting to the db on initial startup, we're not logging that error in the UI
 *      - the error also gets triggered/logged before vite connects (in the logs)
 *    - if unable to find data, need to be able to delete the undefined notes
 */
import { config } from 'config'
import { logger } from 'logger'
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
import { checkIcon } from 'icons'
import type { Note } from 'types'

let isMobile: boolean

window.addEventListener('resize', handleScreenWidth)

window.addEventListener(LifeCycleEvents.Init, async () => {
  try {
    sidebar.render()
    statusBar.render()
    statusBar.renderRemoteDb({ isConnected: false })
    statusBar.renderActiveNote(null)
    handleScreenWidth()

    database.initRemoteConnection()

    const { noteId } = getUrlParams()
    // these events set off the chain that renders the app
    createEvent(NoteEvents.GetAll).dispatch()
    if (!noteId) {
      editor.setDisabled(true)
      editor.setNote(null)
    }
    if (noteId) createEvent(NoteEvents.Select, { _id: noteId }).dispatch()
  } catch (error) {
    logger.logError('Error in LifeCycleEvents.Init.', error)
  }
})

window.addEventListener(LifeCycleEvents.WidthChanged, () => {
  const { noteId } = getUrlParams()
  const isNoteSelected = !!noteId

  if (isNoteSelected) {
    sidebar.close()
  }

  if (!isNoteSelected) {
    isMobile ? setMobileView() : setDesktopView()
  }
})

window.addEventListener(LifeCycleEvents.SidebarOpenOrClose, () => {
  sidebar.getIsOpen() ? sidebar.close() : sidebar.open()
})

window.addEventListener(LifeCycleEvents.SidebarOpened, () => {
  isMobile ? setMobileView() : setDesktopView()
  statusBar.setSidebarButtonActive(true)
})

window.addEventListener(LifeCycleEvents.SidebarClosed, () => {
  setDesktopView()
  statusBar.setSidebarButtonActive(false)
})

window.addEventListener(LifeCycleEvents.ShowSaveNotification, () => {
  const notification = new AppNotification({
    id: 'note-saved',
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
    const { noteId } = getUrlParams()
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
    logger.logError('Error fetching all notes', error)
  }
})

window.addEventListener(NoteEvents.Select, async (event) => {
  try {
    const eventNoteId: string = (event as CustomEvent)?.detail?._id
    if (!eventNoteId) throw new Error('No noteId provided to NoteEvents.Select')

    const note = await database.getById(eventNoteId)
    if (editor.getIsDirty()) await saveNote()

    const { noteId, dialog } = getUrlParams()

    // setup url routing based on the note
    note ? setUrl({ noteId: eventNoteId, dialog }) : setUrl({ noteId, dialog })

    if (isMobile) sidebar.close()

    sidebar.setActiveNote(noteId)
    statusBar.renderActiveNote(note)

    if (note?.updatedAt)
      statusBar.renderSavedOn(new Date(note.updatedAt).toLocaleString())

    editor.setNote(note)
    editor.setCursorPosition('start')

    // based on URL params, render dialogs
    // TODO: use consts
    switch (dialog) {
      case 'delete':
        note && createEvent(DialogEvents.OpenNoteDelete).dispatch()
        break
      case 'database':
        createEvent(DialogEvents.OpenDatabase).dispatch()
        break
      default:
        break
    }

    createEvent(NoteEvents.GetAll).dispatch()
  } catch (error) {
    logger.logError('Error selecting note.', error)
  }
})

window.addEventListener(NoteEvents.Create, async (event) => {
  const title = (event as CustomEvent)?.detail?.title
  try {
    const { _id } = await database.put({ title, content: '' })
    sidebar.closeInput()
    createEvent(NoteEvents.Select, { _id }).dispatch()
    createEvent(NoteEvents.GetAll).dispatch()
  } catch (error) {
    logger.logError('Error creating note.', error)
  }
})

window.addEventListener(NoteEvents.Save, async () => {
  try {
    const { updatedAt } = await saveNote()
    statusBar.renderSavedOn(new Date(updatedAt ?? '').toLocaleString())
    createEvent(NoteEvents.GetAll).dispatch() // updates rest of state
    createEvent(LifeCycleEvents.ShowSaveNotification).dispatch()
  } catch (error) {
    logger.logError('Error saving note.', error)
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
    logger.logError('Error updating note title.', error)
  }
})

window.addEventListener(NoteEvents.Delete, async (event) => {
  try {
    const note = (event as CustomEvent)?.detail?.note as Note
    await database.delete(note)
    logger.logInfo(`Note deleted: ${note.title}`)
    // reset state
    setUrl({})
    createEvent(DialogEvents.Closed).dispatch()
    createEvent(NoteEvents.GetAll).dispatch()
    createEvent(NoteEvents.Select, { _id: '' }).dispatch() // TODO: this causes an error
  } catch (error) {
    logger.logError('Error deleting note.', error)
  }
})

/**
 * Remote database events
 */
window.addEventListener(DatabaseEvents.Connecting, () => {
  console.log(
    'connecting now. Disable form inputs, show loading indicator in db dialog AND status bar'
  )
  statusBar.renderRemoteDb({ isConnected: false, isConnecting: true })
})

window.addEventListener(DatabaseEvents.ConnectingError, () => {
  // TODO: consider after testing: should probably update text to say "Unable to connect"
  statusBar.renderRemoteDb({ isConnected: false, isConnecting: false })
})

window.addEventListener(DatabaseEvents.Connected, () => {
  statusBar.renderRemoteDb({ isConnected: true })
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
    const dialog = document.querySelectorAll('[role="dialog"]')[0]
    ;(dialog as HTMLElement)?.focus()
  }

  setTimeout(
    focusDialog,
    100 // need timeout delay to allow dialog to render
  )

  const dialogTitle = (event as CustomEvent)?.detail?.param as string
  // TODO: dialog titles need to be a const so I can do safer checks.
  // should come from the dialog Class
  if (dialogTitle === 'database') statusBar.renderAlert('') // clear the statusBar's alert state

  const { noteId } = getUrlParams()
  setUrl({ noteId, dialog: dialogTitle })

  editor.setDisabled(true)
})

window.addEventListener(DialogEvents.Closed, () => {
  const { noteId } = getUrlParams()
  if (noteId) editor.setDisabled(false)
  setUrl({ noteId })
})

window.addEventListener(DialogEvents.OpenNoteDelete, async () => {
  const { noteId } = getUrlParams()
  if (!noteId) return
  const note = await database.getById(noteId)
  if (note) noteDeleteDialog.render(note)
})

window.addEventListener(DialogEvents.OpenDatabase, () => {
  databaseDialog.render()
})

/**
 * Log events
 */
window.addEventListener(LoggerEvents.Update, () => {
  // TODO: move this to the databaseDialog (however, we need knowledge of ERROR of not)
  databaseDialog.renderStatus()
  // Need to know if this is an error or not,
  // because then I can know what to render in the db status section
  // (latest error or all good state)
})

// TODO: move this to the log's type
window.addEventListener(LoggerEvents.Error, (event) => {
  const message = (event as CustomEvent)?.detail?.message
  if (message) {
    statusBar.renderAlert(message)
    // TODO: if there is an error, then trigger the databaseDialog.setError
    // to re-render.
    databaseDialog.setError(message)
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
  const { noteId } = getUrlParams()
  if (!noteId) throw new Error('No note selected.')
  const note = await database.getById(noteId)
  if (!note) throw new Error('No note found.')
  return note
}

function getUrlParams() {
  const searchParams = new URLSearchParams(window.location.search)
  return {
    dialog: searchParams.get('dialog') ?? '',
    noteId: searchParams.get('noteId') ?? '',
  }
}

function setUrl({
  noteId = '',
  dialog = '',
}: {
  noteId?: string
  dialog?: string
}) {
  try {
    const url = new URL(
      config.BASE_URL === '/' ? window.location.origin : config.BASE_URL,
      window.location.origin
    )
    const allowedParams = ['noteId', 'dialog']
    // only prepare to set defined, allowed params
    const params = allowedParams.reduce(
      (acc, key) => {
        if (key === 'noteId' && noteId) acc[key] = noteId
        if (key === 'dialog' && dialog) acc[key] = dialog
        return acc
      },
      {} as Record<string, string>
    )

    url.search = params ? new URLSearchParams(params).toString() : ''
    window.history.replaceState({}, '', url.toString())
  } catch (error) {
    logger.logError('Error setting URL.', error)
  }
}
