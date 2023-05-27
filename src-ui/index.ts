// Potential way to make this easier to work with...
// once I am pretty good on the structure for this,
// I can create all divs dynamically and use const values
// for ids like #editor-menu, etc.
// then I don't have to manage ids from index.html, ts files, and .css
// it could be scoped closer to all script files and the smallest .css

import { Editor } from "@tiptap/core";
import { createEditor } from "./editor";
import { toggleIsActiveCss } from "./toggle-is-active-css";

// top-level app state
let editor: null | Editor = null;

window.addEventListener("DOMContentLoaded", async () => {
  editor = createEditor();

  // TODO once I see a pattern
  //
  // create a handful of these 'most used' buttons
  // and then figure out an abstraction for it
  // most likely an object configuration pattern
  // where i can set "text" and "function"
  // and then the object array renders them in order
  const toggleBold = (editor: Editor) => {
    // set editor
    editor.chain().focus().toggleBold().run();
    toggleIsActiveCss({
      elementId: "#menu-button-bold", // todo, need to move this into a CONST
      markName: "bold",
      editor,
    });
  };

  const boldButton = document.createElement("button");
  boldButton.id = "menu-button-bold";
  boldButton.innerText = "Bold";
  boldButton.onclick = () => editor && toggleBold(editor);
  const editorMenuElement = document.querySelector("#editor-menu");

  if (editorMenuElement) editorMenuElement.appendChild(boldButton);
});
