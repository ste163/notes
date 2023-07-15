import { Editor } from "@tiptap/core";
import {
  createEditor,
  setEditorContent,
  createBoldButton,
  createH1Button,
  createSaveButton,
} from "./editor";
import {
  initializeFileStructure,
  getNotes,
  writeNote,
  deleteNote,
} from "./api";
import { renderGetStarted, renderSidebarNoteList } from "./renderer";
import { toggleActiveClass } from "./utils";
import { emitSelectedNote } from "./event-emitters";
import { renderClient } from "./renderer";
import { Note } from "./api/interfaces";

// top-level app state (keep as small as possible)
let editor: null | Editor = null;
let notes: Note[] = []; // TODO: create own Note interface and use that only
let selectedNote: null | Note = null;

function selectMostRecentNote(notes: Note[]) {
  // TODO: this actually only fetches the last CREATED note
  // not the one that was most recently updated. but this works for now
  const { name, path } = notes[notes.length - 1];
  if (!name || !path) throw new Error("Unable to get most recent note");
  emitSelectedNote(name, path);
}

// TODO
// BUG ON NOTE SELECTION
// if you have the cursor in the editor
// and select a different note
// - the scroll is not reset to the top of the editor
// - the older cursor is still in the editor
// need to reset state properly

/**
 * Refetch all data and re-render complete
 * interface with latest data/state
 */
async function refreshClient(): Promise<void> {
  const {
    sidebarElement,
    editorElement,
    editorMenuElement,
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

  renderSidebarNoteList(sidebarElement, notes);

  const editorMenuButtons = [
    createSaveButton(editor),
    createBoldButton(editor),
    createH1Button(editor),
  ];
  editorMenuButtons.forEach((button) => {
    editorMenuElement.appendChild(button);
  });

  /**
   * This has no effect on initial render
   * as the event listeners have not been attached.
   * This selects on every other call to refresh
   */
  selectMostRecentNote(notes);
}

/**
 * All events live inside of DOMContentLoaded
 * as that is when the DOM is ready to be manipulated
 */
window.addEventListener("DOMContentLoaded", async () => {
  /**
   * Setup the initial state based on filesystem
   */
  await initializeFileStructure(); // TODO: move out into another location (preferably client-api)
  await refreshClient();

  /**
   * All events related to the different app life-cycles
   */
  window.addEventListener("refresh-client", async () => {
    await refreshClient();
  });

  window.addEventListener("create-note", async (event) => {
    const { title, content } = (event as CustomEvent)?.detail?.note;
    await writeNote(title, content);
    const refreshEvent = new Event("refresh-client");
    dispatchEvent(refreshEvent);
  });

  window.addEventListener("save-note", async (event) => {
    if (!selectedNote?.name) throw new Error("No note selected to save");
    const { content } = (event as CustomEvent)?.detail?.note;
    await writeNote(selectedNote?.name, content);
  });

  window.addEventListener("delete-note", async (event) => {
    const { path } = (event as CustomEvent)?.detail?.note;
    await deleteNote(path);
    const refreshEvent = new Event("refresh-client");
    dispatchEvent(refreshEvent);
  });

  window.addEventListener("select-note", (event) => {
    if (!editor) throw Error("No editor instance found for note-select event");
    const { title, path } = (event as CustomEvent)?.detail?.note;
    setEditorContent(editor, path);
    // TODO/NOTE: issue with this approach: CSS maintenance nightmare!
    toggleActiveClass(`#${title}-note-select-container`, "select-note");
    selectedNote = { name: title, path };
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
    // each floating menu button must be a new instance of the button type
    const floatingMenuButtons = [createH1Button(editor)];
    floatingMenuButtons.forEach((button) =>
      floatingMenuContainer.appendChild(button)
    );
  });

  /**
   * This only runs once, on initial load
   * to select the most recent note
   */
  selectMostRecentNote(notes);
});
