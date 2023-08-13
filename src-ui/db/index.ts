import { nanoid } from "nanoid";
import PouchDb from "pouchdb-browser";
import PouchDbFind from "pouchdb-find";

// if it works, this can be setup to use user-specified
// server location, which could be requested on first load

// NOTE:
// this should probably be a class, so I can do one instance
// and then call the methods that use that instance.
// for now though, will set the db locally

let dbState: any = null;

async function initDb() {
  PouchDb.plugin(PouchDbFind);
  const db = new PouchDb("local_db_test");

  db.createIndex({
    index: { fields: ["_id"] },
  });

  // TODO
  // pouchDb does not support exported interfaces
  // it seems, but double check online;
  // however, by doing this as a Class, it might
  // be able to share the interface from the instance?
  // but maybe not.
  dbState = db;

  return db;
}

// will need to setup the index for the database
// so will need an initialization function that could eventually
// have the config setup for the remote db

// should export the functions for reading and writing documents

// TODO: rename to Note if this ends up working out
export interface Db_Note {
  _id: string; // if this is used as the createdAt, then I can get some things for free
  // like sorting. BIG ISSUE WITH THAT. Timezones. Less dates the better.
  // unless it's always UTC?
  _rev?: string; // only exists on items in the db, may need 2 separate interfaces, a base and an extended one with _rev
  title: string;
  content: string; // all the JSON
  createdAt: Date; // or string?
  updatedAt: Date; // or string?
}

// TODO: add error handling
// potentially try/catch here OR do not
// and have the consumer do that as any failures
// will more easily be able to render the error states

//  if it all works, create a PutNote or PartialNote type
async function putNote(note: { title: string; content: string }) {
  // get note by Id
  // if it exists, update it
  // if it doesn't exist, create it

  const { id } = await dbState.put({
    ...note,
    _id: nanoid(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Db_Note);
  return id;
}

async function deleteNote(note: Db_Note) {
  // its odd that this await isn't working... need to look at docs later
  const response = await dbState.remove({ _id: note._id, _rev: note._rev });
  console.log(response);
}

async function getAllNotes() {
  const { rows } = await dbState.allDocs({
    include_docs: true,
    descending: true,
  });
  return rows.reduce((acc, { doc }) => {
    const note = doc as Db_Note;
    acc[note._id] = note;
    return acc;
  }, {} as Record<string, Db_Note>);
}

export { initDb, putNote, deleteNote, getAllNotes };
