/**
 * Architecture plan:
 * An API-service that sits between the client
 * and the tauri API would be ideal. Why?
 * Because I'd like to also deploy this app
 * to the web and use the browser's private file system
 * to read and write notes to. This would require having
 * the deployment environment decide which backend service to use.
 * Vite would also exclude bundling the code related to the unused service
 *
 * But because of the API service, the Client will never know what it's using:
 * whether it's the browser or the actual desktop app.
 */

import {
  BaseDirectory,
  appDataDir,
  createDir,
  exists,
  join,
  readDir,
  readTextFile,
  writeFile,
  removeFile,
} from "./allowed-tauri-apis";
import { Note } from "./interfaces";
// TODO: add error handling at correct places

/**
 * Creates the '/notes' directory that holds all html files.
 * If it already exists, does nothing.
 *
 * Note: ideally this would run in Rust and not the UI
 *
 * @returns Promise<void>
 */
async function initializeFileStructure(): Promise<void> {
  const NOTES_PATH = await join(await appDataDir(), "notes");
  const doesNotesExist = await exists(NOTES_PATH);
  if (doesNotesExist) return; // we've already initialized the data structure once
  await createDir("notes", {
    dir: BaseDirectory.AppData,
    recursive: true,
  });
}

async function getNotes(): Promise<Note[]> {
  return await readDir("notes", {
    dir: BaseDirectory.AppData,
  });
}

async function writeNote(title: string, contents: string) {
  // TODO: check that the file name isn't already taken
  await writeFile(await join("notes", title), contents, {
    dir: BaseDirectory.AppData,
  });
  // this approach is not ideal but it should work for short-term
  // get all notes, then filter by title
  const notes = await getNotes();
  const note = notes.find((note) => note.name === title) ?? null;
  return { note };
}

async function deleteNote(path: string) {
  await removeFile(path);
}

async function readNote(path: string) {
  return await readTextFile(path);
}

export { initializeFileStructure, getNotes, writeNote, deleteNote, readNote };
