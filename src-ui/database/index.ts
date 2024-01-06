import PouchDb from 'pouchdb-browser'
import PouchDbFind from 'pouchdb-find'
import { nanoid } from 'nanoid'
import { createEvent } from 'event'
import type { Note } from 'types'

class Database {
  private db: PouchDB.Database
  private remoteUrl: string

  constructor(remoteUrl: string) {
    PouchDb.plugin(PouchDbFind)
    this.db = new PouchDb('notes')
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
       * it will be cleaned up by the garbage collectors
       */
      new PouchDb(this.remoteUrl)
        .info()
        .then(() => {
          // successfully made the connection
          createEvent('remote-db-connected').dispatch()
        })
        .catch((error) => {
          // unable to connect for some reason
          // TODO:
          // render, in the footer, a notification icon and error button
          // that renders a modal with the error message with helpful info
          // (event on who called it, the actual error message, etc.)
          console.log('REMOTE CONNECTION ERROR', error)
        })
    }
  }

  setupSyncing(): void {
    // NOTE: potentially move this to a syncHandler property.
    // Probably if i want to stop syncing, because I need a way to stop it.
    // However, I may be able to call this.db.sync.cancel directly
    this.db
      .sync(this.remoteUrl, {
        live: true,
        retry: true,
      })
      .on('paused', () => {
        // paused means replication has completed or connection was lost without an error.
        // emit the date for the 'last synced' date
        createEvent('remote-db-sync-paused', { date: new Date() }).dispatch()
      })
      .on('error', (error) => {
        console.error('remote db sync ERROR event', error)
      })
      .on('denied', (error) => {
        console.log('denied error', error)
      })
      .catch((error) => {
        console.log('CATCH ERROR', error)
      })
  }

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
  async getAll() {
    const { rows } = await this.db.allDocs({
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
}

export { Database }
