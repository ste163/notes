/**
 * TODO PRIORITY ORDER
 * - UI/UX polish
 *   - error notification (in footer)
 *   - checkbox styling is wrong
 *   - BUG: when the modal opens, sometimes it doesn't move focus to inside the modal, but keeps it in the editor
 *   - BUG: If the modal is open, the floating menu should not render (it has higher z-index than modal)
 *   - BUG: if there is no UNDO state, hitting undo causes error (disable button if no undo/redo state)
 *   - close/open sidebar and remember state on re-open
 *   - mobile view support (related to close/open sidebar)
 * - Code Quality (before release):
 *   - clean-up todos
 *   - try/catch blocks per component. Will make debugging much easier
 * - Features: Quality of Life
 *   - ability to rename note titles
 *   - (later) auto-save toggle button with interval setting (most reliable way to save since I can't reliably intercept the close window event)
 *   - (later): visual explanation of available shortcuts
 * - REMOTE DB
 *   - setup the remote db that connects to the docker container
 * - DEPLOYMENT
 *   - setup deployment for UI only to browsers (no remote db access)
 *   - setup deployment for tauri app
 */

import { renderBaseElements, renderGetStarted, renderEditor } from "renderer";
import { Database } from "database";
import { createEvent } from "event";
import { EditorStore, StatusStore } from "store";
import type { Note } from "types";
import type { Editor } from "@tiptap/core";

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
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    selectedNoteId = sortedNotes[0]?._id;
  }
  // reset global state
  EditorStore.isDirty = false;

  await refreshClient({ notes, selectedNoteId });
});

window.addEventListener("create-note", async (event) => {
  const { title, content = "" } = (event as CustomEvent)?.detail?.note;
  const id = await database.put({ title, content });
  selectedNoteId = id;
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("save-note", async () => {
  await saveNote();
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

window.addEventListener("select-note", async (event) => {
  if (EditorStore.isDirty) await saveNote();
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
 * Main app lifecycle, refresh based on latest state
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
  const { editorElement, editorTopMenuElement, editorFloatingMenuElement } =
    renderBaseElements(notes);

  // set main element content based on note state
  if (!Object.keys(notes).length) {
    StatusStore.lastSavedDate = null;
    renderGetStarted(editorElement);
    return;
  }

  editor = await renderEditor({
    selectedNoteId,
    editorElement: editorElement,
    topEditorMenu: editorTopMenuElement,
    floatingEditorMenu: editorFloatingMenuElement,
    editorContent: notes[selectedNoteId]?.content,
  });

  toggleActiveClass({
    selector: `#${selectedNoteId}-note-select-container`,
    type: "select-note",
  });
}

async function saveNote() {
  if (!selectedNoteId) throw new Error("No note selected to save");
  const note = notes[selectedNoteId];
  const content = editor.getHTML();
  note.content = content;
  await database.put(note);
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
