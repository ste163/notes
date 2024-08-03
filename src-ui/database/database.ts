import PouchDb from 'pouchdb-browser'
import PouchDbFind from 'pouchdb-find'
import { useLocalStorage } from 'use-local-storage'
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
  private db: PouchDB.Database
  private syncHandler: PouchDB.Replication.Sync<object> | null = null

  constructor() {
    // setup local database
    PouchDb.plugin(PouchDbFind)
    this.db = new PouchDb(config.DATABASE_NAME)
    logger.log('info', 'Loaded local database.')
  }

  public async createIndexes() {
    await this.db.createIndex({
      index: { fields: ['createdAt'] },
    })
  }

  /**
   * Because connection to the remote requires emitting events,
   * must wait until the window is ready.
   */
  public async initRemoteConnection() {
    const url = this.createRemoteUrl()
    if (!url) {
      logger.log(
        'info',
        'No database connection details saved. Saving locally only.'
      )
      return
    }
    this.setRemoteUrl(url)
    logger.log('info', 'Remote database details found.')
    await this.testAndInitializeConnection()
  }

  /**
   * Checks if the given remote url is valid (can the pouchdb client connect to it)
   * and if so, sets up syncing.
   */
  public async testAndInitializeConnection() {
    if (!this.remoteUrl)
      logger.log(
        'error',
        'No remote database details set. Unable to test connection.'
      )
    try {
      const testDb = new PouchDb(`${this.remoteUrl}/${config.DATABASE_NAME}`)
      logger.log(
        'info',
        'Attempting to establish connection with remote database.'
      )
      createEvent(DatabaseEvents.Connecting).dispatch()
      const result = await testDb.info() // will attempt for 1.5 minutes
      logger.log(
        'info',
        `Test connection established with remote database, "${result?.db_name ?? ''}".`
      )
      this.setupSyncing()
    } catch (error) {
      logger.log(
        'error',
        'Unable to establish connection with remote database.'
      )
      createEvent(DatabaseEvents.ConnectingError).dispatch()
    }
  }

  /**
   * For reconnection or setting up a new connection
   * after the initial database setup has occurred.
   */
  public restartConnection() {
    this.disconnectSyncing()
    const url = this.createRemoteUrl()
    if (!url) {
      logger.log(
        'error',
        'No database connection details saved. Saving locally only.'
      )
      return
    }
    this.setRemoteUrl(url)
    this.testAndInitializeConnection()
  }

  public async setupSyncing(): Promise<void> {
    createEvent(DatabaseEvents.Connecting).dispatch()
    logger.log('info', 'Setting up syncing with remote database.')
    this.syncHandler = this.db.sync(
      `${this.remoteUrl}/${config.DATABASE_NAME}`,
      {
        live: true,
        retry: true,
      }
    )
    logger.log('info', 'Syncing with remote database.')
    createEvent(DatabaseEvents.Connected).dispatch()
    this.syncHandler
      .on('paused', () => {
        // paused means replication has completed or connection was lost without an error.
        // emit the date for the 'last synced' date
        const date = new Date()
        createEvent(DatabaseEvents.SyncingPaused, {
          date,
        }).dispatch()
        logger.log(
          'info',
          `Syncing completed at ${new Date(date).toLocaleString()}.`
        )
      })
      .on('error', (error: unknown | Error) => {
        logger.log('error', 'Remote database sync error.', error)
      })
      .on('denied', (error) => {
        logger.log('error', 'Remote database sync denied.', error)
      })
      .catch((error) => {
        logger.log('error', 'Remote database unknown error.', error)
      })
  }

  public disconnectSyncing(): boolean {
    if (!this.syncHandler) {
      logger.log('error', 'No remote database connection to disconnect.')
      return false
    }
    this.syncHandler.cancel()
    this.syncHandler = null
    logger.log('info', 'Disconnected from remote database.')
    return true
  }

  private setRemoteUrl(url: string) {
    this.remoteUrl = url
  }

  private createRemoteUrl() {
    const { username, password, host, port } =
      useLocalStorage.get('remote-db-details')
    // TODO: if this is a tauri build, use `http`
    // if it is a browser build, use `https`
    return username && password && host && port
      ? `https://${username}:${password}@${host}:${port}`
      : null
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
        // note HTML content is saved as an attachment html file.
        // this allows better retrieval performance. Ie, we can fetch
        // only the metadata without the content, which is the largest data.
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
   * @returns {Promise<Record<string, Note>>} record of notes with their ids as keys
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
      logger.log('error', `No note found with id: ${_id}`)
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
