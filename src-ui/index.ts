/**
 * TODO PRIORITY ORDER
 * - UI/UX polish
 *   - save confirmation modal on window close + note switch if dirty
 *   - error notification (in footer)
 *   - checkbox styling is wrong
 *   - window resizing of main button toolbar
 *   - If the modal is open, other keyboard events shouldn't work (like ctrl+s to save)
 *   - If the modal is open, the floating menu should not render (it has higher z-index than modal)
 *   - BUG: if there is no UNDO state, hitting undo causes error (disable button if no undo/redo state)
 * - Code Quality:
 *   - clean-up todos
 *   - try/catch blocks per component. Will make debugging much easier
 *   - test with moving Editor to a proxy store to remove 'prop' drilling/dependency injection
 * - Quality of Life
 *   - auto-save on note switch with dirty editor (or ask to save, modal)
 *   - ability to rename note titles
 *   - (later): visual explanation of available shortcuts
 * - REMOTE DB
 *   - setup the remote db that connects to the docker container
 */

import { renderEditor } from "./renderer/editor";
import {
  renderClient,
  renderGetStarted,
  renderSidebarNoteList,
} from "./renderer";
import { Database } from "./db";
import { Editor } from "@tiptap/core";
import { StatusStore } from "./store";
import { createEvent } from "./events";
import type { Note } from "./types";

// top-level app state (keep as small as possible)
// TODO: revisit notes and selectedNoteId state. Might be best to use a Proxy Store if it's used app-wide
let database: Database;
let editor: Editor;
let notes: Record<string, Note> = {};
let selectedNoteId: null | string = null;

/**
 * Keyboard events
 */
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault(); // prevent default save behavior
    editor &&
      createEvent("save-note", {
        note: { content: editor.getHTML() },
      }).dispatch();
  }
});

/**
 * App life-cycle events
 */
window.addEventListener("refresh-client", async () => {
  /**
   * Note on sorting:
   * by default it's by created_at,
   * but can easily be extended to sort by any note data
   */
  notes = await database.getAll();
  if (!selectedNoteId) {
    /**
     * To start, not calling the db again to get the most recent note.
     * However, if slow downs become noticeable, this would be a place to optimize.
     */
    const sortedNotes = Object.values(notes).sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    selectedNoteId = sortedNotes[0]?._id;
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
  const note = notes[selectedNoteId];
  const { content } = (event as CustomEvent)?.detail?.note;
  note.content = content;
  await database.put(note);
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("delete-note", async (event) => {
  const { id } = (event as CustomEvent)?.detail?.note;
  // TODO:
  // move the fetch to the deleteNote route
  // so we don't have to know the full state here
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
  /**
   * Update state for initial render
   */
  if (selectedNoteId) {
    StatusStore.lastSavedDate = notes[selectedNoteId].updatedAt;
  }
  const {
    sidebarElement,
    editorElement,
    editorTopMenuElement,
    editorFloatingMenuElement,
  } = renderClient();

  // set main element content based on note state
  if (!Object.keys(notes).length) {
    StatusStore.lastSavedDate = null;
    renderGetStarted(editorElement);
    return;
  }
  // notes exist, render state-based components
  renderSidebarNoteList(sidebarElement, notes);

  editor = await renderEditor({
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
  // TODO: only focus on the start if we're selecting a NEW note
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
