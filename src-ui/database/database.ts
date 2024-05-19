import { config } from 'config'
import PouchDb from 'pouchdb-browser'
import PouchDbFind from 'pouchdb-find'
import { nanoid } from 'nanoid'
import { createEvent, DatabaseEvents } from 'event'
import { logger } from 'logger'
import type { Note } from 'types'

/**
 * Note on PouchDB data saving:
 * PouchDB first saves to disk and then the remote
 * Because of this, there should be very little chance
 * of data loss or failures. The most likely failure should be
 * network syncing issues, which will get resolved eventually
 * during re-connections.
 *
 * Because of this local-first approach, I am not locking
 * inputs during save events.
 */

const attachmentId = 'content.html'

class Database {
  private db: PouchDB.Database
  private remoteUrl: string
  private syncHandler: null | PouchDB.Replication.Sync<object>

  constructor(remoteUrl: string) {
    PouchDb.plugin(PouchDbFind)
    this.syncHandler = null
    this.db = new PouchDb(config.DATABASE_NAME)
    this.db.createIndex({
      index: { fields: ['createdAt'] },
    })
    this.remoteUrl = remoteUrl
    if (this.remoteUrl) {
      /**
       * Test the connection to the remote url.
       * If it is connected, then the main process
       * handles the syncing setup.
       *
       * Because this new Pouchdb is not stored or referenced,
       * it will be cleaned up by the garbage collector.
       */
      new PouchDb(`${this.remoteUrl}/${config.DATABASE_NAME}`)
        .info()
        .then(() => {
          // successfully made the connection
          createEvent(DatabaseEvents.RemoteConnected).dispatch()
          logger.logInfo('Connected to remote database.')
        })
        .catch((error) => {
          logger.logError('Remote connection error.', error)
        })
    }
  }

  public async setupSyncing(): Promise<void> {
    this.syncHandler = this.db.sync(
      `${this.remoteUrl}/${config.DATABASE_NAME}`,
      {
        live: true,
        retry: true,
      }
    )

    this.syncHandler
      .on('paused', () => {
        // paused means replication has completed or connection was lost without an error.
        // emit the date for the 'last synced' date
        createEvent(DatabaseEvents.RemoteSyncingPaused, {
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
        logger.logError('Remote database catch-all error.', error)
      })

    logger.logInfo('Syncing with remote database.')
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
      // is an update event
      const lastSavedVersion = await this.getById(note._id) // always get latest _rev
      await this.db.put({
        _id: note._id,
        _rev: lastSavedVersion?._rev,
        title: note.title,
        // note HTML is saved as an attachment html file
        _attachments: {
          [attachmentId]: {
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
        [attachmentId]: {
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
      attachmentId
    )) as unknown as Blob // in browser, it's a Blob; in Node it's a Buffer
    note.content = await attachment?.text()

    return note
  }
}

export { Database }
