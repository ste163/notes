// Potential way to make this easier to work with...
// once I am pretty good on the structure for this,
// I can create all divs dynamically and use const values
// for ids like #editor-menu, etc.
// then I don't have to manage ids from index.html, ts files, and .css
// it could be scoped closer to all script files and the smallest .css

import { Editor } from "@tiptap/core";
import { createEditor } from "./editor";
import {
  createBoldButton,
  createH1Button,
  createSaveButton,
} from "./editor-buttons";
import { getNotes, initializeFileStructure, readNote } from "./api";

// top-level app state
let editor: null | Editor = null;

window.addEventListener("DOMContentLoaded", async () => {
  await initializeFileStructure(); // TODO: check if an earlier event would be better (probably)
  const notes = await getNotes();

  // if NO NOTES, then we do not want to do a lot. Ie, do not setup the editor
  if (!notes.length) {
    console.log("NO NOTES, RENDER A DIFFERENT UI");

    const editorContainer = document.querySelector("#editor");
    if (editorContainer) {
      const element = document.createElement("div");
      // this should be a stringified component, essentially
      // something that would be imported here.
      // it would have all the proper styling
      // and look really nice
      // with all the welcome text and instructions but in the smallest
      // amount of text possible.
      // no one wants to read
      element.innerText = "Create a note to get started";
      editorContainer.appendChild(element);
    }

    return;
  }

  if (notes.length) {
    const sidebarContainer = document.querySelector("#sidebar");

    const setEditorContent = async (editor: Editor, path: string) => {
      const content = await readNote(path);
      editor.commands.setContent(content);
    };

    if (sidebarContainer) {
      function createNewNote() {
        // this will need to trigger a change in UI state:
        // 1. clear out the editor, fully. And/or fully remove it
        // 2. Reset the writing area with a section for the file name
        // 3. once a file name is given, go to the editor
        // however, this introduces the need for two different UI states:
        // - create new note state
        // - editor view state
      }

      const addButton = document.createElement("button");
      addButton.innerText = "+ Create";
      addButton.onclick = () => createNewNote;
      sidebarContainer.appendChild(addButton);

      notes.forEach(({ name, path }) => {
        const selectableNote = document.createElement("button");
        selectableNote.innerText = name ?? "unable to read name";
        selectableNote.onclick = () => editor && setEditorContent(editor, path);
        sidebarContainer.append(selectableNote);
      });
    }
  }

  editor = await createEditor(notes);
  const editorMenuContainer = document.querySelector("#editor-menu");
  const editorMenuButtons = [
    createSaveButton(editor),
    createBoldButton(editor),
    createH1Button(editor),
  ];
  if (editorMenuContainer)
    editorMenuButtons.forEach((button) => {
      editorMenuContainer.appendChild(button);
    });

  // each menu type must have its own button instance
  const floatingMenuButtons = [createH1Button(editor)];

  // TODO: figure out a better place for handling these events?
  // however, if the main index.ts is mainly setup and only events,
  // this works fine
  //
  // floatingMenu buttons need to be appended in the event for showing
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
