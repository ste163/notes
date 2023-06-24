import {
  BaseDirectory,
  appDataDir,
  createDir,
  exists,
  join,
  readDir,
  readTextFile,
  writeFile,
} from "./allowed-tauri-apis";
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
  console.log("PATH TO NOTES", NOTES_PATH);
  const doesNotesExist = await exists(NOTES_PATH);
  if (doesNotesExist) return; // we've already initialized the data structure once
  await createDir("notes", {
    dir: BaseDirectory.AppData,
    recursive: true,
  });
}

async function getNotes() {
  return await readDir("notes", {
    dir: BaseDirectory.AppData,
  });
}

async function getMostRecentNote() {
  const notes = await getNotes();
  if (notes.length) {
    return await readTextFile(notes[0].path);
  }
  return null;
}

async function writeNote(title: string, contents: string) {
  console.log(contents);
  await writeFile(await join("notes", title), contents, {
    dir: BaseDirectory.AppData,
  });
}

export { initializeFileStructure, getNotes, getMostRecentNote, writeNote };
