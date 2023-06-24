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
import { getNotes, initializeFileStructure } from "./api";

// top-level app state
let editor: null | Editor = null;

window.addEventListener("DOMContentLoaded", async () => {
  await initializeFileStructure(); // TODO: check if an earlier event would be better (probably)
  const notes = await getNotes();
  console.log("ALL NOTES", notes);
  // todo: with the notes
  // render out the list of note file names
  // and then attach onclick events
  // to read their contents and set the editor state
  // to that notes contents

  editor = await createEditor();
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
