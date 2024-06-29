import PouchDb from 'pouchdb-browser'
import PouchDbFind from 'pouchdb-find'
import { useDatabaseDetails } from './use-database-details'
import { config } from 'config'
import { logger } from 'logger'
import { nanoid } from 'nanoid'
import { createEvent, DatabaseEvents } from 'event'
import type { Note } from 'types'

/**
 * Note on PouchDB data saving:
 * The only async events with PouchDB that the client needs
 * to be concerned with is connecting to the remote database.
 * All syncing operations are handled by PouchDB in the background.
 *
 * PouchDB saves to disk first and sync to remote after that is successful.
 * Because of this, the client does not disable inputs or wait for loading
 * except for during connection, reconnection, or disconnection events.
 */
class Database {
  private attachmentId = 'content.html'
  private remoteUrl: string | null = null
  private syncHandler: PouchDB.Replication.Sync<object> | null = null
  private db: PouchDB.Database

  constructor() {
    // setup local database
    PouchDb.plugin(PouchDbFind)
    this.db = new PouchDb(config.DATABASE_NAME)
    // this check is for tests only. TODO: fix it
    if (this.db.createIndex)
      this.db?.createIndex({
        index: { fields: ['createdAt'] },
      })

    logger.logInfo('Loaded local database.')
  }

  /**
   * Because connection to the remote requires emitting events,
   * must wait until the window is ready.
   */
  public initRemoteConnection() {
    const { username, password, host, port } = useDatabaseDetails.get()
    if (!username || !password || !host || !port) {
      logger.logInfo(
        'No database connection details saved. Saving locally only.'
      )
      return
    }
    this.remoteUrl = `http://${username}:${password}@${host}:${port}`
    logger.logInfo('Remote database details found.')
    // because constructors can't be async, continue setup elsewhere
    this.testConnection()
  }

  public setRemoteUrl(url: string) {
    this.remoteUrl = url
  }

  /**
   * Used to determine if the given remote URL is valid
   */
  public async testConnection() {
    if (!this.remoteUrl)
      logger.logError(
        'No remote database details set. Unable to test connection.'
      )
    try {
      const testDb = new PouchDb(`${this.remoteUrl}/${config.DATABASE_NAME}`)
      logger.logInfo('Attempting to establish connection with remote database.')
      // TODO:
      // WHILE THIS IS OCCURRING, NEED TO DISABLE DATABASE DIALOG FORM
      // AND SHOW LOADING INDICATOR IN STATUS BAR
      createEvent(DatabaseEvents.Connecting).dispatch()
      const result = await testDb.info()
      // TODO: figure out: how LONG will this attempt to wait?? There appear to be no options for it...
      // seems to be close to 2min, need to inform user of this.
      // ie (Attempting to connect... (animate the dots) and in parens (will attempt for up to two minutes))
      logger.logInfo(
        `Test connection established with remote database, "${result?.db_name ?? ''}".`
      )
      this.setupSyncing()
    } catch (error) {
      logger.logError('Unable to establish connection with remote database.')
    }
  }

  public async setupSyncing(): Promise<void> {
    createEvent(DatabaseEvents.Connecting).dispatch()
    logger.logInfo('Setting up syncing with remote database.')
    this.syncHandler = this.db.sync(
      `${this.remoteUrl}/${config.DATABASE_NAME}`,
      {
        live: true,
        retry: true,
      }
    )
    logger.logInfo('Syncing with remote database.')
    createEvent(DatabaseEvents.Connected).dispatch()
    this.syncHandler
      .on('paused', () => {
        // paused means replication has completed or connection was lost without an error.
        // emit the date for the 'last synced' date
        createEvent(DatabaseEvents.SyncingPaused, {
          date: new Date(),
        }).dispatch()
      })
      .on('error', (error: unknown | Error) => {
        logger.logError('Remote database sync error.', error)
      })
      .on('denied', (error) => {
        logger.logError('Remote database sync denied.', error)
      })
      .catch((error) => {
        logger.logError('Remote database unknown error.', error)
      })
  }

  public disconnectSyncing(): boolean {
    if (this.syncHandler) {
      this.syncHandler.cancel()
      logger.logInfo('Disconnected from remote database.')
      return true
    }
    logger.logError('Error disconnecting from remote database.')
    return false
  }

  public async put(
    note: Partial<Note>
  ): Promise<{ _id: string; updatedAt: Date }> {
    const date = new Date()
    if (note?._id) {
      await this.db.put({
        _id: note._id,
        _rev: note?._rev,
        title: note.title,
        // note HTML is saved as an attachment html file
        _attachments: {
          [this.attachmentId]: {
            content_type: 'text/html',
            data: new Blob([note.content ?? ''], { type: 'text/html' }),
          },
        },
        createdAt: note.createdAt,
        updatedAt: date,
      })
      return { _id: note._id, updatedAt: date }
    }
    // then this is a new note
    const { id } = await this.db.put({
      _id: `id${nanoid()}`,
      title: note.title ?? 'ERROR: no title',
      _attachments: {
        [this.attachmentId]: {
          content_type: 'text/html',
          data: new Blob([''], { type: 'text/html' }),
        },
      },
      createdAt: date,
      updatedAt: date,
    })
    return { _id: id, updatedAt: date }
  }

  public async delete(note: Note) {
    if (note._rev) await this.db.remove({ _id: note._id, _rev: note._rev })
  }

  /**
   * Fetches all note metadata sorted by createdAt
   * @returns {Promise<Record<string, Note>>} - A record of notes with their ids as keys
   */
  public async getAll(): Promise<Record<string, Note>> {
    const { docs } = await this.db.find({
      selector: {
        createdAt: { $exists: true },
      },
      fields: ['_id', 'title', 'createdAt', 'updatedAt'],
      sort: [{ createdAt: 'desc' }],
    })
    return docs.reduce(
      (acc, note) => {
        return {
          ...acc,
          [note._id]: note as Note,
        }
      },
      {} as Record<string, Note>
    )
  }

  /**
   * Fetch all note data and its content
   *
   * @param _id string
   * @returns Note | null
   */
  public async getById(_id: string): Promise<Note | null> {
    const { docs } = await this.db.find({
      selector: { _id },
      limit: 1,
    })

    if (!docs.length) {
      logger.logError(`No note found with id: ${_id}`)
      return null
    }

    const note = docs[0] as Note
    const attachment = (await this.db.getAttachment(
      note._id,
      this.attachmentId
    )) as unknown as Blob // in browser, it's a Blob; in Node it's a Buffer
    note.content = await attachment?.text()

    return note
  }
}

const database = new Database()

export { database }
