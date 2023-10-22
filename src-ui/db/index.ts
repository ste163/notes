import { nanoid } from "nanoid";
import PouchDb from "pouchdb-browser";
import PouchDbFind from "pouchdb-find";
import { Note } from "../types";

/**
 * Creates the Pouchdb database instance
 * with the methods for interacting with the db
 */
class Database {
  private db: PouchDB.Database;
  // TODO:
  // need to read docs on how pouchdb connects to a remote and then export
  // a method for getting the status information in the Status type
  // for rendering in footer

  /**
   * TODO: for first version, only using the local db.
   * Next version is to hook into a remote db for syncing
   */
  constructor(_remoteUrl?: string) {
    PouchDb.plugin(PouchDbFind);
    this.db = new PouchDb("local_db_test");
    this.db.createIndex({
      index: { fields: ["_id"] },
    });
  }

  /**
   * Creates or updates a note and returns its id
   */
  async put(note: Partial<Note>): Promise<string> {
    // TODO:
    // get note by id
    // if exists, update else create
    if (note?._id) {
      await this.db.put({
        ...note,
        updatedAt: new Date(),
      });
      return note._id;
    }

    const { id } = await this.db.put({
      ...note,
      _id: `id${nanoid()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Note);
    return id;
  }

  async delete(note: Note) {
    // TODO: better error handling around this
    if (note._rev) {
      const response = await this.db.remove({ _id: note._id, _rev: note._rev });
      console.log("DELETE RESPONSE", response);
    }
  }

  async getAll() {
    const { rows } = await this.db.allDocs({
      include_docs: true,
      descending: true,
    });
    return rows.reduce((acc, { doc }) => {
      if (!(doc as any).title) return acc; // pouchdb always returns a language query doc, ignore that and only return real notes
      const note = doc as Note;
      acc[note._id] = note;
      return acc;
    }, {} as Record<string, Note>);
  }
}

export { Database };
