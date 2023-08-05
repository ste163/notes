/**
 * TODO PRIORITY ORDER
 * - get all the editor buttons hooked up (once we have that, we're at v0.1)
 *    - link
 *    - code blocks
 *    - checkbox lists (tasklist)
 *    - EXTENSIONS
 *    - History
 *
 * - then it's UI/UX polish
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
} from "./api";
import { renderDeleteButton, renderSaveButton } from "./renderer/components";
import {
  createEditor,
  setEditorContent,
  instantiateEditorButtons,
} from "./renderer/editor";
import {
  renderClient,
  renderGetStarted,
  renderSidebarNoteList,
} from "./renderer";
import { emitSelectedNote } from "./events";

// top-level app state (keep as small as possible)
let editor: null | Editor = null;
let notes: Note[] = []; // TODO: create own Note interface and use that only
let selectedNote: null | Note = null;

// TODO
// BUG ON NOTE SELECTION
// if you have the cursor in the editor
// and select a different note
// - the scroll is not reset to the top of the editor
// - the older cursor is still in the editor
// need to reset state properly

/**
 * All events live inside of DOMContentLoaded
 * as that is when the DOM is ready to be manipulated
 */
window.addEventListener("DOMContentLoaded", async () => {
  /**
   * Setup the initial state based on filesystem
   */
  await initializeFileStructure(); // TODO: needs to happen in the rust backend
  await refreshClient();

  /**
   * All events related to the different app life-cycles
   */
  window.addEventListener("refresh-client", async () => {
    await refreshClient();
  });

  window.addEventListener("create-note", async (event) => {
    const { title, content = "" } = (event as CustomEvent)?.detail?.note;
    await writeNote(title, content); // TODO: writeNote needs to return the file path
    // so that I can select this note for the below:
    // selectedNote = { name: title, path };
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
    if (!editor) throw Error("No editor instance found for note-select event");
    const { title, path } = (event as CustomEvent)?.detail?.note;
    selectedNote = { name: title, path };
    dispatchEvent(new Event("refresh-client"));
  });

  // floatingMenu buttons need to be appended in the event for rendering
  window.addEventListener("floating-menu-shown", () => {
    if (!editor) throw new Error("No editor instance found for floating menus");
    const floatingMenuContainer = document.querySelector(
      "#editor-floating-menu"
    );
    if (!floatingMenuContainer) return;
    // fully reset the container content state
    floatingMenuContainer.innerHTML = "";
    const { floatingMenuButtons } = instantiateEditorButtons(editor);
    floatingMenuButtons.forEach((button) => {
      floatingMenuContainer.appendChild(button);
    });
  });

  /**
   * This only runs once, on initial load
   * to select the most recent note
   */
  // TODO: this should not happen. Why?
  // the rust backend, when it loads (ie the api)
  // should return Notes before DOMCONTENTLOADED.
  // this way when we render, we're already ready to go
  selectMostRecentNote(notes);
});

/**
 * Refetch all data and re-render complete
 * interface with latest data/state
 */
async function refreshClient(): Promise<void> {
  const {
    sidebarElement,
    editorElement,
    editorTopMenuElement,
    editorFloatingMenuElement,
  } = renderClient();

  notes = await getNotes();

  /**
   * Set <main /> content based on if notes exist
   */
  if (!notes.length) {
    renderGetStarted(editorElement);
    return;
  }
  // notes exist, render editor & sidebar state
  editor = await createEditor({
    editorElement: editorElement,
    floatingEditorMenu: editorFloatingMenuElement,
  });

  // setup editor content buttons (bold, italic, etc.)
  const { topMenuButtons } = instantiateEditorButtons(editor);
  topMenuButtons.forEach((button) => {
    // todo: based on button type, I can place them in a different container:
    // ie, position to the left, position to the middle, position to the far right container!
    editorTopMenuElement.appendChild(button);
  });

  // add non-editor specific buttons
  // TODO: this divider element will need a class that I can target
  // so that all dividers for the top-menu can be styled the same
  // POTENTIALLY though, just use .top-menu-bar > div
  // as that might be the best solution... That's best...
  const dividerElement = document.createElement("div");
  editorTopMenuElement.appendChild(dividerElement);

  dividerElement.appendChild(renderSaveButton(editor));
  if (selectedNote) {
    dividerElement.appendChild(renderDeleteButton(selectedNote?.path));
  }

  renderSidebarNoteList(sidebarElement, notes);

  // last state updates need to be related to the selected note
  if (selectedNote) {
    setEditorContent(editor, selectedNote.path);
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
