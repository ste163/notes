import { nanoid } from "nanoid";
import PouchDb from "pouchdb-browser";
import PouchDbFind from "pouchdb-find";

interface Note {
  _id: string;
  _rev?: string; // only exists on items in the db, may need 2 separate interfaces, a base and an extended one with _rev
  title: string;
  content: string; // all the JSON
  createdAt: Date; // or string?
  updatedAt: Date; // or string?
}

class Database {
  private db: PouchDB.Database;

  constructor(serverUrl?: string) {
    // TODO: implement user-defined server-urls
    // use localStorage first
    //
    // NOTE: will need to render whether they are connected to a db
    // and if they are, need to display the url
    if (serverUrl) {
      console.log("SERVER URL IS", serverUrl);
    } else {
      console.log("no serverUrl");
    }

    PouchDb.plugin(PouchDbFind);
    this.db = new PouchDb("local_db_test");

    this.db.createIndex({
      index: { fields: ["_id"] },
    });
  }

  // TODO: use a partial type from Note
  async put(note: { title: string; content: string } | Note) {
    // TODO:
    // get note by id
    // if exists, update else create
    if (note?._id) {
      await this.db.put(note);
      return;
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
    const response = await this.db.remove({ _id: note._id, _rev: note._rev });
    console.log("DELETE RESPONSE", response);
  }

  async getAll() {
    const { rows } = await this.db.allDocs({
      include_docs: true,
      descending: true,
    });
    return rows.reduce((acc, { doc }) => {
      if (!doc.title) return acc; // pouchdb returns a language query doc, ignore that and only return legit notes
      const note = doc as Note;
      acc[note._id] = note;
      return acc;
    }, {} as Record<string, Note>);
  }
}

export { Database };
export type { Note };
