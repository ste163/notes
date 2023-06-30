import { Editor } from "@tiptap/core";
import { createEditor } from "./editor";
import {
  createBoldButton,
  createH1Button,
  createSaveButton,
} from "./editor-buttons";
import { getNotes, initializeFileStructure, readNote } from "./api";
import { renderSidebar } from "./components/sidebar";
import { renderGetStarted } from "./components/get-started";

// TODO: see if this top-level editor is even needed. (I don't think so...)
// top-level app state (keep as small as possible)
let editor: null | Editor = null;

window.addEventListener("DOMContentLoaded", async () => {
  /**
   * Ensure the expected HTML structure exists
   */
  const sidebarContainer = document.querySelector("#sidebar");
  const editorMenuContainer = document.querySelector("#editor-menu");
  const editorContainer = document.querySelector("#editor");
  if (!sidebarContainer || !editorContainer || !editorMenuContainer)
    throw new Error("Missing required HTML elements");

  renderSidebar(sidebarContainer);

  await initializeFileStructure(); // TODO: check if an earlier event would be better (probably)
  const notes = await getNotes();

  if (!notes.length) {
    renderGetStarted(editorContainer);
    return;
  }

  // TODO: move the editor rendering and this life-cycle stuff
  // to a new location?
  const setEditorContent = async (editor: Editor, path: string) => {
    const content = await readNote(path);
    editor.commands.setContent(content);
  };

  notes.forEach(({ name, path }) => {
    const selectableNote = document.createElement("button");
    selectableNote.innerText = name ?? "unable to read name";
    selectableNote.onclick = () => editor && setEditorContent(editor, path);
    sidebarContainer.append(selectableNote);
  });

  editor = await createEditor(notes);
  const editorMenuButtons = [
    createSaveButton(editor),
    createBoldButton(editor),
    createH1Button(editor),
  ];
  editorMenuButtons.forEach((button) => {
    editorMenuContainer.appendChild(button);
  });

  // each menu type must have its own button instance
  const floatingMenuButtons = [createH1Button(editor)];

  // TODO: figure out a better place for handling these events?
  // however, if the main index.ts is mainly setup and only events,
  // this works fine
  //
  // floatingMenu buttons need to be appended in the event for rendering
  window.addEventListener("floating-menu-shown", () => {
    const floatingMenuContainer = document.querySelector(
      "#editor-floating-menu"
    );
    if (floatingMenuContainer)
      floatingMenuButtons.forEach((button) =>
        floatingMenuContainer.appendChild(button)
      );
  });
});
