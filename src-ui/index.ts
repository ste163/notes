/**
 * TODO PRIORITY ORDER
 * - UI/UX polish
 *   - error notification (in footer)
 *   - checkbox styling is wrong
 *   - clean-up modal styling
 *   - BUG: when the modal opens, sometimes it doesn't move focus to inside the modal, but keeps it in the editor
 *   - BUG: If the modal is open, the floating menu should not render (it has higher z-index than modal)
 *   - close/open sidebar and remember state on re-open
 *   - (before web-only release) mobile view support (related to close/open sidebar)
 * - Code Quality (before release):
 *   - clean-up todos
 *   - try/catch blocks per component. Will make debugging much easier
 * - Features: Quality of Life
 *   - ability to rename note titles
 *   - (placed in footer) auto-save toggle button with interval setting (most reliable way to save since I can't reliably intercept the close window event)
 *   - (later): visual explanation of available shortcuts
 * - REMOTE DB
 *   - setup the remote db that connects to the docker container
 *   - set this up as an "extension"; ie, only ship the remote code if it's the desktop env
 * - DEPLOYMENT
 *   - setup deployment for UI only to browsers (no remote db access)
 *   - setup deployment for tauri app
 */

import { Database } from "database";
import { createEvent } from "event";
import { NoteStore, EditorStore, StatusStore } from "store";
import { renderBaseElements, renderGetStarted, renderEditor } from "renderer";

// top-level app state (keep as small as possible)
let database: Database;

/**
 * Keyboard events
 */
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault(); // prevent default save behavior
    EditorStore.editor &&
      createEvent("save-note", {
        note: { content: EditorStore.editor.getHTML() },
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
  NoteStore.notes = await database.getAll();
  if (!NoteStore.selectedNoteId) {
    /**
     * To start, not calling the db again to get the most recent note.
     * However, if slow downs become noticeable, this would be a place to optimize.
     */
    const sortedNotes = Object.values(NoteStore.notes).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    NoteStore.selectedNoteId = sortedNotes[0]?._id;
  }
  // reset global state
  EditorStore.isDirty = false;

  await refreshClient();
});

window.addEventListener("create-note", async (event) => {
  const { title, content = "" } = (event as CustomEvent)?.detail?.note;
  const id = await database.put({ title, content });
  NoteStore.selectedNoteId = id;
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("save-note", async () => {
  await saveNote();
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("delete-note", async () => {
  if (!NoteStore.selectedNoteId) throw new Error("No note selected to delete");
  const noteToDelete = NoteStore.notes[NoteStore.selectedNoteId];
  await database.delete(noteToDelete);
  NoteStore.selectedNoteId = null; // reset selected note as it was deleted
  // TODO: if all notes have been deleted, null the lastSaved state
  // in the StatusStore
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("select-note", async (event) => {
  if (EditorStore.isDirty) await saveNote();
  const { id } = (event as CustomEvent)?.detail?.note;
  NoteStore.selectedNoteId = id;
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
async function refreshClient(): Promise<void> {
  /**
   * Update state for initial render
   */
  if (NoteStore.selectedNoteId) {
    StatusStore.lastSavedDate =
      NoteStore.notes[NoteStore.selectedNoteId].updatedAt;
  }
  const { editorElement, editorTopMenuElement, editorFloatingMenuElement } =
    renderBaseElements();

  // set main element content based on note state
  if (
    !Object.keys(NoteStore.notes).length ||
    !NoteStore.selectedNoteId ||
    !editorTopMenuElement
  ) {
    StatusStore.lastSavedDate = null;
    renderGetStarted(editorElement);
    return;
  }

  EditorStore.editor = await renderEditor({
    editorElement: editorElement,
    topEditorMenu: editorTopMenuElement,
    floatingEditorMenu: editorFloatingMenuElement,
    editorContent: NoteStore.notes[NoteStore.selectedNoteId]?.content,
  });

  // set which note in the note-list is active
  toggleActiveClass({
    selector: `#${NoteStore.selectedNoteId}-note-select-container`,
    type: "select-note",
  });
}

async function saveNote() {
  if (!NoteStore.selectedNoteId || !EditorStore.editor)
    throw new Error("No note selected to save or no editor instance");
  const note = NoteStore.notes[NoteStore.selectedNoteId];
  const content = EditorStore.editor.getHTML();
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
