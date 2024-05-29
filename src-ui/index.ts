// COMPONENT to refactor into class:
// DB Dialog

/**
 * TODO PRIORITY ORDER
 *  - AUTO SAVE open editor state on note select (before swapping to new note)
 *  - render note title when it is selected (above the editor)
 *  - add a warning banner for web-only builds that says:
 *  "Running: web version. This is version is for demo purposes only. Please download
 *   the application for the best experience."
 *  - DATABASE should be a single class instance, like the other classes (so i can remove local state)
 *  - BUG: renaming a note resets content to its first saved state. Even if the editor saved the latest it gets over-written.
 *    this is because we don't reset the editor state after saving content. One solution would be to pass in an ID into
 *    the details dialog and always fetch by id.
 *  - db dialog: showing if connected to local only or remote
 *  - consolidate events. Do not use Get and Got, but use Get only
 *  - github action to run tests and require them to pass before merging. Only run builds if tests pass
 *  - cleanup styling of the initial state so that there is a clean layout that doesn't re-adjust on first render
 *    - move all console.logs and console.errors to the logger() - include state updates. We want to log all db interactions
 *      - fetches, errors, saves, deletes, etc.
 *    - include the Remix icons apache license AND pouchdb AND tauri in the repo and as a 'legal/about' button (or i icon next to the version number) that renders a dialog in the footer
 *      - could include info about the application, its version, its license and the remix icon license
 *     - BUG: floating menu disappears after selecting a note (its only on the first render)
 *     - BUG: if there is an error when connecting to the db on initial startup, we're not logging that error in the UI
 *             - the error also gets triggered/logged before vite connects (in the logs)
 *     - BUG: if unable to find data, need to be able to delete the undefined notes
 *     - BUG: sidebar: if a note is selected, apply the DISABLED state to it
 * - FEATURES
 *   - keyboard shortcuts for saving
 *   - (placed in footer)? auto-save toggle button with interval setting (most reliable way to save since I can't reliably intercept the close window event)
 *   - mobile view (sidebar only + selected note only, state lives in URL)
 *   - hyperlinks in the editor
 *   - save cursor position to the note object so we can re-open at the correct location
 *   - BUG: tab order is broken for the floating menu if there is a checkbox in the editor
 * - BRANDING
 *  - make favicon
 *  - make icons for desktop
 */
import { config } from 'config'
import {
  LifeCycleEvents,
  KeyboardEvents,
  LoggerEvents,
  DialogEvents,
  DatabaseEvents,
  NoteEvents,
  createEvent,
} from 'event'
import { Database, useRemoteDetails } from 'database'
import { logger } from 'logger'

import {
  sidebar,
  footer,
  editor,
  renderRemoteDbLogs,
  renderRemoteDbDialog,
  noteDetailsDialog,
} from 'renderer/reactive'
import type { Note } from 'types'

let database: Database
let isMobile: boolean

window.addEventListener('resize', handleScreenWidth)

window.addEventListener(LifeCycleEvents.Init, async () => {
  try {
    sidebar.render()
    footer.render()
    footer.renderRemoteDb({ isConnected: false })
    editor.render()
    handleScreenWidth()

    // setup database after app is rendering in loading state
    setupDatabase()
    const { noteId } = getUrlParams()
    // these events set off the chain that renders the app
    createEvent(NoteEvents.GetAll).dispatch()
    if (!noteId) editor.setDisabled(true)
    if (noteId) createEvent(NoteEvents.Select, { _id: noteId }).dispatch()
  } catch (error) {
    logger.logError('Error in LifeCycleEvents.Init.', error)
  }
})

window.addEventListener(LifeCycleEvents.WidthChanged, () => {
  const { noteId } = getUrlParams()
  const isNoteSelected = !!noteId

  if (isNoteSelected) {
    sidebar.toggleCloseButtonVisibility(true)
    isMobile
      ? sidebar.getIsOpen()
        ? setMobileView()
        : setDesktopView()
      : setDesktopView()
  }

  if (!isNoteSelected) {
    sidebar.toggleCloseButtonVisibility(false)
    isMobile ? setMobileView() : setDesktopView()
  }
})

window.addEventListener(LifeCycleEvents.SidebarOpened, () => {
  isMobile ? setMobileView() : setDesktopView()
})

window.addEventListener(LifeCycleEvents.SidebarClosed, () => {
  setDesktopView()
})

/**
 * Note events for fetching, selecting, and CRUD operations
 */
window.addEventListener(NoteEvents.GetAll, async () => {
  try {
    const notes = await database.getAll()
    createEvent(NoteEvents.GotAll, { notes }).dispatch()
  } catch (error) {
    // TODO: WOULD BE NICE to have a custom eslint rule that does:
    // - if you are using console.error, say it's an error and say you need to use logger
    logger.logError('Error fetching all notes', error)
  }
})

window.addEventListener(NoteEvents.GotAll, (event) => {
  const notes = (event as CustomEvent)?.detail?.notes
  const { noteId } = getUrlParams()

  // TODO: if no notes, then emit a new event
  // to handle that state so that we can reset the UI
  // TODO: only renderNoteList if there are notes
  // OR, we have a more generic method for supplying updated notes
  // to the note list
  sidebar.renderNoteList(notes)

  if (noteId)
    toggleActiveClass({
      selector: `#${noteId}-note-select-container`,
      type: NoteEvents.Select,
    })
})

window.addEventListener(NoteEvents.Select, async (event) => {
  try {
    const noteId: string = (event as CustomEvent)?.detail?._id
    if (!noteId) throw new Error('No noteId provided to NoteEvents.Select')
    createEvent(NoteEvents.Selected, { _id: noteId }).dispatch()
  } catch (error) {
    logger.logError('Error selecting note.', error)
  }
})

/**
 * Selected that handles fetching and rendering of the main editor body
 */
window.addEventListener(NoteEvents.Selected, async (event) => {
  try {
    const eventNoteId = (event as CustomEvent)?.detail?._id ?? ''
    if (!eventNoteId)
      throw new Error('No noteId provided to NoteEvents.Selected')
    const note = await database.getById(eventNoteId)
    const { noteId, dialog } = getUrlParams()
    // setup url routing based on the note
    note ? setUrl({ noteId: eventNoteId, dialog }) : setUrl({ noteId, dialog })

    if (isMobile) sidebar.close()

    // update styling for the selected note in list
    toggleActiveClass({
      selector: `#${note?._id}-note-select-container`,
      type: NoteEvents.Select,
    })

    // TODO: revisit isDirty saving on a changed note event
    // if (EditorStore.isDirty) await saveNote(note)

    if (note?.updatedAt)
      footer.renderLastSaved(new Date(note.updatedAt).toLocaleString())

    editor.setNote(note)

    editor.setCursorPosition('start')

    // based on URL params, render dialogs
    // TODO: use consts
    switch (dialog) {
      case 'details':
        note && createEvent(DialogEvents.OpenNoteDetails).dispatch()
        break
      case 'database':
        // BUG: this does not actually render based on the isConnected state
        // coming from the db. We need to have this state accessible somehow
        // to render this dialog properly
        renderRemoteDbDialog({ isConnectedToRemote: false, error: '' })
        break
      default:
        break
    }
  } catch (error) {
    // TODO: render error that selecting note failed (probably passing the error into the editor body)
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
    const note = await fetchNoteFromUrl()
    const { updatedAt } = await database.put({
      ...note,
      content: editor.getContent(),
    })
    footer.renderLastSaved(new Date(updatedAt ?? '').toLocaleString())
    // ensure rest of state is updated
    createEvent(NoteEvents.GetAll).dispatch()
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
    footer.renderLastSaved(new Date(updatedAt ?? '').toLocaleString())
    editor.setNote({ ...updatedNote, updatedAt })
    noteDetailsDialog.render({ ...updatedNote, updatedAt })
    createEvent(NoteEvents.GetAll).dispatch()
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
 * - Separated RemoteConnect and RemoteConnected as
 *   as the connection process is asynchronous
 */
window.addEventListener(DatabaseEvents.RemoteConnect, () => {
  // TODO: only connect if not already connected
  setupDatabase()
  // the database emits the DatabaseEvents.RemoteConnected event if it successfully connects
})

window.addEventListener(DatabaseEvents.RemoteConnected, () => {
  footer.renderRemoteDb({ isConnected: true })
  database.setupSyncing()
  // TODO: so the syncing has been setup, but the currently selected note MAY be out-dated.
  // probably not an issue as couchDB is good at syncing, but potentially something that could be an issue
  createEvent(NoteEvents.GetAll).dispatch()
  // should we re-select the selected note?
  // we'd need to SAVE it before changing though
})

window.addEventListener(DatabaseEvents.RemoteDisconnect, () => {
  const successfulDisconnect = database.disconnectSyncing()
  if (successfulDisconnect) footer.renderRemoteDb({ isConnected: false })
  // TODO: need to clear the remote details from local storage
  // so we do not reconnect on refresh
})

window.addEventListener(DatabaseEvents.RemoteSyncingPaused, (event) => {
  const date = (event as CustomEvent)?.detail?.date
  footer.renderLastSynced(new Date(date).toLocaleString())
  // TODO:
  // this also needs to be stored in local storage
  // so that we can render that on the chance that we are unable to connect
  // to the remote, we can still render when the last time was we did successfully connect
})

/**
 * Dialog events
 *
 * This are more specific to handling application state and less so on handling rendering
 */
window.addEventListener(DialogEvents.Opened, (event) => {
  // Trap focus inside the dialog, disable editor, and set URL params
  setTimeout(() => {
    // need timeout delay to allow dialog to render
    const dialog = document.querySelectorAll('[role="dialog"]')[0]
    ;(dialog as HTMLElement)?.focus()
  }, 100)

  const dialogTitle = (event as CustomEvent)?.detail?.param as string

  // TODO: dialog titles need to be a const so I can do safer checks.
  // should come from the dialog Class
  if (dialogTitle === 'database') {
    // clear the footer's alert state
    footer.renderAlert('')
  }

  const { noteId } = getUrlParams()
  setUrl({ noteId, dialog: dialogTitle })

  editor.setDisabled(true)
})

window.addEventListener(DialogEvents.Closed, () => {
  const { noteId } = getUrlParams()
  if (noteId) editor.setDisabled(false)
  setUrl({ noteId })
})

window.addEventListener(DialogEvents.OpenNoteDetails, async () => {
  const { noteId } = getUrlParams()
  if (!noteId) return
  const note = await database.getById(noteId)
  if (note) noteDetailsDialog.render(note)
})

/**
 * Log events
 */
window.addEventListener(LoggerEvents.Update, (event) => {
  const logs = (event as CustomEvent)?.detail?.logs
  const dbLogContainer = document.querySelector('#remote-db-logs')
  if (dbLogContainer) renderRemoteDbLogs(dbLogContainer, logs)
})

window.addEventListener(LoggerEvents.Error, (event) => {
  const message = (event as CustomEvent)?.detail?.message
  if (message) footer.renderAlert(message)
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

function setupDatabase() {
  // TODO: this should live in the Database instance
  try {
    const { username, password, host, port } = useRemoteDetails().get()
    database = new Database(
      username ? `http://${username}:${password}@${host}:${port}` : ''
    )
  } catch (error) {
    logger.logError('Error setting up database.', error)
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

// TODO:
// move this to the sidebar as that is the only place this is used
// sidebar.setActiveNote()
// can handle all of this.
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

async function fetchNoteFromUrl() {
  const { noteId } = getUrlParams()
  if (!noteId) throw new Error('No note selected.')
  const note = await database.getById(noteId)
  if (!note) throw new Error('No note found.')
  return note
}

function getUrlParams() {
  const searchParams = new URLSearchParams(window.location.search)
  const params = Array.from(searchParams).reduce(
    (acc, [key, value]) => {
      acc[key] = value
      return acc
    },
    {} as Record<string, string>
  )
  return {
    dialog: params.dialog,
    noteId: params.noteId,
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
