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
import { renderScaffold, renderGetStarted } from "./layout";
import { renderSidebar, renderSidebarNoteList } from "./components";
import { toggleActiveClass } from "./toggle-active-class";
import { emitSelectedNote } from "./event-emitters";
import { FileEntry } from "@tauri-apps/api/fs";

// TODO: see if this top-level editor is even needed. (I don't think so...)
// top-level app state (keep as small as possible)
let editor: null | Editor = null;
let notes: FileEntry[] = [];

function selectMostRecentNote(notes: FileEntry[]) {
  const { name, path } = notes[notes.length - 1];
  if (!name || !path) throw new Error("Unable to get most recent note");
  emitSelectedNote(name, path);
}

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
  } = renderScaffold();
  renderSidebar(sidebarElement);
  notes = await getNotes();
  if (!notes.length) {
    renderGetStarted(editorElement);
    return;
  }

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

  // todo: keep an eye on event listeners for a pattern
  window.addEventListener("create-note", async (event) => {
    const { title, content } = (event as CustomEvent)?.detail?.note;
    await writeNote(title, content);
    const refreshEvent = new Event("refresh-client");
    dispatchEvent(refreshEvent);
  });

  window.addEventListener("delete-note", async (event) => {
    const { path } = (event as CustomEvent)?.detail?.note;
    await deleteNote(path);
    const refreshEvent = new Event("refresh-client");
    dispatchEvent(refreshEvent);
  });

  window.addEventListener("note-selected", (event) => {
    if (!editor) throw Error("No editor instance found for note-select event");
    const { title, path } = (event as CustomEvent)?.detail?.note;
    setEditorContent(editor, path);
    // TODO/NOTE: issue with this approach: CSS maintenance nightmare!
    toggleActiveClass(`#${title}-note-select-container`, "select-note");
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
