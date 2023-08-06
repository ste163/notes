/**
 * TODO PRIORITY ORDER
 * - UI/UX polish
 * - bug fixes
 * - clean-up old todos
 * - potentially setup basic shortcuts (outside of tiptap)? Ie, cmd+s to save, visually indicator for saving was successful. Ie last saved timestamp
 */
import { Editor } from "@tiptap/core";
import { Note } from "./api/interfaces";
import {
  initializeFileStructure,
  getNotes,
  writeNote,
  deleteNote,
  readNote,
} from "./api";
import { renderEditor, instantiateEditorButtons } from "./renderer/editor";
import {
  renderClient,
  renderGetStarted,
  renderSidebarNoteList,
} from "./renderer";
import { emitSelectedNote } from "./events";

// top-level app state (keep as small as possible)
let editor: null | Editor = null; // used for the floating-menu event
let selectedNote: null | Note = null;

// TODO
// BUG ON NOTE SELECTION
// if you have the cursor in the editor
// and select a different note
// - the scroll is not reset to the top of the editor
// - the older cursor is still in the editor
// need to reset state properly

/**
 * All events related to the different app life-cycles
 */
window.addEventListener("refresh-client", async () => {
  const notes = await getNotes();
  await refreshClient(notes, selectedNote);
});

window.addEventListener("create-note", async (event) => {
  const { title, content = "" } = (event as CustomEvent)?.detail?.note;
  const { note } = await writeNote(title, content);
  selectedNote = note;
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("save-note", async (event) => {
  if (!selectedNote?.name) throw new Error("No note selected to save");
  const { content } = (event as CustomEvent)?.detail?.note;
  await writeNote(selectedNote?.name, content);
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("delete-note", async (event) => {
  const { path } = (event as CustomEvent)?.detail?.note;
  await deleteNote(path);
  selectedNote = null; // reset selected note as it was deleted. You can only delete selected notes
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("select-note", (event) => {
  const { title, path } = (event as CustomEvent)?.detail?.note;
  selectedNote = { name: title, path };
  dispatchEvent(new Event("refresh-client"));
});

// TODO: could this potentially be moved into the editor.ts?
// along with that, the editor instance could be passed into the event?
// GOAL: remove the top-level state for the editor
//
// floatingMenu buttons need to be appended in the event for rendering
window.addEventListener("floating-menu-shown", () => {
  if (!editor) throw new Error("No editor instance found for floating menus");
  const floatingEditorMenuContainer = document.querySelector(
    "#editor-floating-menu"
  );
  if (!floatingEditorMenuContainer) return;
  // fully reset the container content state
  floatingEditorMenuContainer.innerHTML = "";
  const { floatingEditorMenuButtons } = instantiateEditorButtons(editor);
  floatingEditorMenuButtons.forEach((button) => {
    floatingEditorMenuContainer.appendChild(button);
  });
});

/**
 * All events related to running the app have been created.
 * Initial file structure state has been setup.
 * The DOM has loaded.
 * Can be sure by this point the client is ready to render.
 */
window.addEventListener("DOMContentLoaded", async () => {
  await initializeFileStructure(); // TODO: needs to happen in the rust backend before DOM CONTENT LOADED

  // todo:
  // ideally, by this point, we do not call refresh-client
  // but the backend will have already fetched data.
  // so we just need to render the client
  //
  // so then there are two lifecycles:
  // 1. initial load
  // 2. any update

  dispatchEvent(new Event("refresh-client"));
});

/**
 * Main app lifecycle function.
 * Renders the stateless client
 * then decides what to render based on passed-in note state
 */
async function refreshClient(
  notes: Note[],
  selectedNote: Note | null
): Promise<void> {
  // render stateless components
  const {
    sidebarElement,
    editorElement,
    editorTopMenuElement,
    editorFloatingMenuElement,
  } = renderClient();

  // Set <main /> content based on note state
  if (!notes.length) {
    renderGetStarted(editorElement);
    return;
  }

  // notes exist, render state-based components
  renderSidebarNoteList(sidebarElement, notes);

  editor = await renderEditor({
    selectedNote,
    editorElement: editorElement,
    topEditorMenu: editorTopMenuElement,
    floatingEditorMenu: editorFloatingMenuElement,
  });

  // if a note was selected, render that
  // otherwise, select the most recent
  if (selectedNote) {
    const content = await readNote(selectedNote?.path);
    editor.commands.setContent(content);
    toggleActiveClass(
      `#${selectedNote.name}-note-select-container`,
      "select-note"
    );
  } else {
    selectMostRecentNote(notes);
  }
}

function selectMostRecentNote(notes: Note[]) {
  // TODO: this actually only fetches the last CREATED note
  // not the one that was most recently updated. but this works for now
  const { name, path } = notes[notes.length - 1];
  if (!name || !path) throw new Error("Unable to get most recent note");
  emitSelectedNote(name, path);
}

function toggleActiveClass(selector: string, type: string) {
  const activeType = `${type}-active`;
  // remove any active classes
  const elementsToClear = document.querySelectorAll(`.${activeType}`);
  elementsToClear?.forEach((element) => {
    element.classList.remove(activeType);
  });
  // assign activeType to selector
  const elementToActivate = document.querySelector(selector);
  elementToActivate?.classList.add(activeType);
}
