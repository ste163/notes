import { config } from 'config'
import PouchDb from 'pouchdb-browser'
import PouchDbFind from 'pouchdb-find'
import { nanoid } from 'nanoid'
import { createEvent, DatabaseEvents } from 'event'
import { logger } from 'logger'
import type { Note } from 'types'

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
      index: { fields: ['_id'] },
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

  async setupSyncing(): Promise<void> {
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

  disconnectSyncing(): boolean {
    if (this.syncHandler) {
      this.syncHandler.cancel()
      logger.logInfo('Disconnected from remote database.')
      return true
    }
    logger.logError('Error disconnecting from remote database.')
    return false
  }

  async put(note: Partial<Note>): Promise<string> {
    if (note?._id) {
      // then this is an update event on an existing note
      await this.db.put({
        _id: note._id,
        _rev: note._rev,
        title: note.title,
        // note HTML is saved as an attachment html file
        _attachments: {
          [attachmentId]: {
            content_type: 'text/html',
            data: new Blob([note.content ?? ''], { type: 'text/html' }),
          },
        },
        createdAt: note.createdAt,
        updatedAt: new Date(),
      })
      return note._id
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
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return id
  }

  async delete(note: Note) {
    if (note._rev) await this.db.remove({ _id: note._id, _rev: note._rev })
  }

  /**
   * Fetches all notes sorted by created_at
   * @returns {Promise<Record<string, Note>>} - A record of notes with their ids as keys
   */
  async getAll(): Promise<Record<string, Note>> {
    const { rows } = await this.db.allDocs({
      include_docs: true,
      descending: true,
      // by default, pouchDb does not include attachments,
      // but will include attachment metadata
    })

    // TODO: update the fetch do sort by createdAt from the start.
    // let the API do the heavy lifting.
    // will probably need to set keys and use pouchdb-find
    rows.sort((a, b) => {
      return (
        new Date((a?.doc as Note)?.createdAt).getTime() -
        new Date((b?.doc as Note)?.createdAt).getTime()
      )
    })

    return rows.reduce(
      (acc, { doc }) => {
        const noteDoc = doc as Note
        if (!noteDoc.title)
          // pouchdb always returns a language query doc;
          // ignore that and only return real notes
          return acc
        acc[noteDoc._id] = noteDoc
        return acc
      },
      {} as Record<string, Note>
    )
  }

  async getById(_id: string): Promise<Note | null> {
    // id could be an empty string, which is a valid param, but not a valid id
    if (!_id) return null

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
