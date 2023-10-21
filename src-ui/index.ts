/**
 * TODO PRIORITY ORDER
 * - DB Restructure
 *   - local PouchDB, not connected to a server yet. Can I get it working fully?
 * - BUGS
 *   - task list styling is off. Tiptap bug?
 * - UI/UX polish
 *   - last saved timestamp in footer
 *   - error notification (in footer)
 *   - delete confirmation
 * - Code Quality:
 *   - Note and FileEntry decide on Title or Name for the note
 *   - clean-up todos
 *   - try/catch blocks per component. Will make debugging much easier
 *   - ask chatgpt for info on tips for a vanilla JS SPA
 * - Quality of Life
 *   - rename note titles
 *   - crtl+s saves
 *   - auto-save on note switch with dirty editor (or ask to save)
 *   - (later): visual explanation of available shortcuts
 */

import { renderEditor } from "./renderer/editor";
import {
  renderClient,
  renderGetStarted,
  renderSidebarNoteList,
} from "./renderer";
import { Database } from "./db";
import { renderFooter } from "./renderer/footer";
import { Note } from "./types";
import { StatusStore } from "./store";

// top-level app state (keep as small as possible)
let database: Database;
let notes: Record<string, Note> = {}; // NOTE: can I get rid of notes state?
let selectedNoteId: null | string = null;

/**
 * All events related to the different app life-cycles
 */
window.addEventListener("refresh-client", async () => {
  /**
   * Note on sorting:
   * by default it's by created_at,
   * but can easily be extended to sort by any note data
   */
  notes = await database.getAll();
  if (!selectedNoteId) {
    // todo: get the last edited note
    selectedNoteId = Object.keys(notes)[0];
  }
  await refreshClient({ notes, selectedNoteId });
});

window.addEventListener("create-note", async (event) => {
  const { title, content = "" } = (event as CustomEvent)?.detail?.note;
  const id = await database.put({ title, content });
  selectedNoteId = id;
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("save-note", async (event) => {
  if (!selectedNoteId) throw new Error("No note selected to save");
  // TODO: gonna need to know notes state
  // so I can get the full data;
  // unless I move that to the PUT function
  const note = notes[selectedNoteId];
  const { content } = (event as CustomEvent)?.detail?.note;
  note.content = content;
  await database.put(note);
  // TEST for re-rendering
  // would be better to use the date from the db
  // also update based on when a note is selected
  StatusStore.lastSavedDate = new Date();
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("delete-note", async (event) => {
  const { id } = (event as CustomEvent)?.detail?.note;
  // TODO:
  // move the fetch to the deleteNote route
  const noteToDelete = notes[id];
  await database.delete(noteToDelete);
  selectedNoteId = null; // reset selected note as it was deleted
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("select-note", (event) => {
  const { id } = (event as CustomEvent)?.detail?.note;
  selectedNoteId = id;
  dispatchEvent(new Event("refresh-client"));
});

/**
 * All events related to running the app have been created.
 * Initial file structure state has been setup.
 * The DOM has loaded.
 * Can be sure by this point the client is ready to render.
 */
window.addEventListener("DOMContentLoaded", async () => {
  database = new Database();
  dispatchEvent(new Event("refresh-client"));
});

/**
 * Main app lifecycle function.
 * Renders the stateless client
 * then decides what to render based on passed-in note state
 */
async function refreshClient({
  notes,
  selectedNoteId,
}: {
  notes: Record<string, Note>;
  selectedNoteId: string;
}): Promise<void> {
  // render stateless components
  const {
    sidebarElement,
    footerElement,
    editorElement,
    editorTopMenuElement,
    editorFloatingMenuElement,
  } = renderClient();
  // set main element content based on note state
  if (!Object.keys(notes).length) {
    renderGetStarted(editorElement);
    return;
  }
  // notes exist, render state-based components
  renderSidebarNoteList(sidebarElement, notes);
  renderFooter(footerElement, {});

  const editor = await renderEditor({
    selectedNoteId,
    editorElement: editorElement,
    topEditorMenu: editorTopMenuElement,
    floatingEditorMenu: editorFloatingMenuElement,
  });
  // set editor content to the selected note
  const content = notes[selectedNoteId]?.content;
  editor.commands.setContent(content);
  // Problem: cannot use the Date _id
  // as that is not a valid selector for the dom.
  // needs to be something like a uuid
  toggleActiveClass({
    selector: `#${selectedNoteId}-note-select-container`,
    type: "select-note",
  });
  // reset editor scroll position
  editorElement.scrollTop = 0;
  // focus on editor
  editor.commands.focus("start");
}

function toggleActiveClass({
  selector,
  type,
}: {
  selector: string;
  type: string;
}) {
  try {
    const activeType = `${type}-active`;
    // remove any active classes
    const elementsToClear = document.querySelectorAll(`.${activeType}`);
    elementsToClear?.forEach((element) => {
      element?.classList?.remove(activeType);
    });
    // assign activeType to selector
    const elementToActivate = document.querySelector(selector);
    elementToActivate?.classList.add(activeType);
  } catch (error) {
    console.error(error);
  }
}
