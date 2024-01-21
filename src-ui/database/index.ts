import PouchDb from 'pouchdb-browser'
import PouchDbFind from 'pouchdb-find'
import { nanoid } from 'nanoid'
import { createEvent, DatabaseEvents } from 'event'
import { logger } from 'logger'
import { useRemoteDetails } from './use-remote-details'
import type { Note } from 'types'

const DB_NAME = 'notes'

// TODO: these methods will also need to emit events for their completion
// that way other components can listen for things like "db connected"
// and can enable and disable buttons/loading states accordingly

class Database {
  private db: PouchDB.Database
  private remoteUrl: string
  private syncHandler: null | PouchDB.Replication.Sync<object>

  constructor(remoteUrl: string) {
    PouchDb.plugin(PouchDbFind)
    this.syncHandler = null
    this.db = new PouchDb(DB_NAME)
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
      new PouchDb(`${this.remoteUrl}/${DB_NAME}`)
        .info()
        .then(() => {
          // successfully made the connection
          createEvent(DatabaseEvents.RemoteConnected).dispatch()
          logger('info', 'Connected to remote database.')
        })
        .catch(() => {
          logger('error', 'Remote connection error.')
        })
    }
  }

  async setupSyncing(): Promise<void> {
    this.syncHandler = this.db.sync(`${this.remoteUrl}/${DB_NAME}`, {
      live: true,
      retry: true,
    })

    this.syncHandler
      .on('paused', () => {
        // paused means replication has completed or connection was lost without an error.
        // emit the date for the 'last synced' date
        createEvent(DatabaseEvents.RemoteSyncingPaused, {
          date: new Date(),
        }).dispatch()
      })
      .on('error', (error: unknown | Error) => {
        logger('error', 'Remote database sync error.', error)
      })
      .on('denied', (error) => {
        logger('error', 'Remote database sync denied.', error)
      })
      .catch((error) => {
        logger('error', 'Remote database catch-all error.', error)
      })

    logger('info', 'Syncing with remote database.')
  }

  disconnectSyncing(): boolean {
    if (this.syncHandler) {
      this.syncHandler.cancel()
      logger('info', 'Disconnected from remote database.')
      return true
    }
    logger('error', 'Error disconnecting from remote database.')
    return false
  }

  // TODO: use attachments to store legit .html files for each note:
  // https://pouchdb.com/guides/attachments.html
  // this way, I can use attachments: false on the getAll query to only get metadata
  // it will potentially be easier to export notes as well, as they're already legit html files
  // in the database
  async put(note: Partial<Note>): Promise<string> {
    if (note?._id) {
      await this.db.put({
        ...note,
        updatedAt: new Date(),
      })
      return note._id
    }

    const { id } = await this.db.put({
      ...note,
      _id: `id${nanoid()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Note)
    return id
  }

  async delete(note: Note) {
    if (note._rev) await this.db.remove({ _id: note._id, _rev: note._rev })
  }

  /**
   * Fetches all notes sorted by created_at and returned as Record<id, Note>
   */
  // TODO: make this a getAllMetadata (as its everything but the documents themselves)
  async getAll() {
    const { rows } = await this.db.allDocs({
      // TODO: use the
      // fields key to include which key:values to return
      // example:
      // fields: ['_id', '_rev', 'title', 'createdAt', 'updatedAt']
      // ALSO sort these by createdAt so that the db does the work
      include_docs: true,
      descending: true,
    })

    // TODO: update the fetch do sort by createdAt from the start.
    // let the API do the heavy lifting
    rows.sort((a, b) => {
      return (
        new Date((a.doc as Note).createdAt).getTime() -
        new Date((b.doc as Note).createdAt).getTime()
      )
    })

    return rows.reduce(
      (acc, { doc }) => {
        if (!(doc as Note).title) return acc // pouchdb always returns a language query doc, ignore that and only return real notes
        const note = doc as Note
        acc[note._id] = note
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

    if (docs.length) return docs[0] as Note
    return null
  }
}

export { Database, useRemoteDetails }
