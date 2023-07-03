import { Editor } from "@tiptap/core";
import {
  createEditor,
  setEditorContent,
  createBoldButton,
  createH1Button,
  createSaveButton,
} from "./editor";
import { initializeFileStructure, getNotes, writeNote } from "./api";
import { renderScaffold, renderGetStarted } from "./layout";
import { renderSidebar, renderSidebarNoteList } from "./components";

// TODO: see if this top-level editor is even needed. (I don't think so...)
// top-level app state (keep as small as possible)
let editor: null | Editor = null;

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
  const notes = await getNotes();
  if (!notes.length) {
    renderGetStarted(editorElement);
    return;
  }

  editor = await createEditor({
    notes,
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
}

window.addEventListener("DOMContentLoaded", async () => {
  /**
   * Setup the initial state based on filesystem
   */
  await initializeFileStructure();
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

  window.addEventListener("note-selected", (event) => {
    if (!editor) throw Error("No editor instance found for note-select event");
    const { path } = (event as CustomEvent)?.detail?.note;
    setEditorContent(editor, path);

    // TODO:
    // add the active class to the selected note
    // but will need to remove the active class from any other selected note
    // which probably means I need a function
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
});
