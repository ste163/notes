import { Editor } from "@tiptap/core";
import { createEditor, setEditorContent } from "./editor";
import {
  createBoldButton,
  createH1Button,
  createSaveButton,
} from "./editor-buttons";
import { initializeFileStructure, getNotes, writeNote } from "./api";
import { renderScaffold, renderGetStarted, renderSidebar } from "./layout";

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

  notes.forEach(({ name, path }) => {
    const selectableNote = document.createElement("button");
    selectableNote.innerText = name ?? "unable to read name";
    selectableNote.onclick = () => editor && setEditorContent(editor, path);
    sidebarElement.append(selectableNote);
  });

  editor = await createEditor({
    notes,
    editorElement: editorElement,
    floatingEditorMenu: editorFloatingMenuElement,
  });

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

  // floatingMenu buttons need to be appended in the event for rendering
  window.addEventListener("floating-menu-shown", () => {
    const floatingMenuContainer = document.querySelector(
      "#editor-floating-menu"
    );
    // each floating menu button must be a new instance of the button type
    if (floatingMenuContainer && editor)
      [createH1Button(editor)].forEach((button) =>
        floatingMenuContainer.appendChild(button)
      );
  });
});
