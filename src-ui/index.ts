// Potential way to make this easier to work with...
// once I am pretty good on the structure for this,
// I can create all divs dynamically and use const values
// for ids like #editor-menu, etc.
// then I don't have to manage ids from index.html, ts files, and .css
// it could be scoped closer to all script files and the smallest .css

import { Editor } from "@tiptap/core";
import { createEditor } from "./editor";
import { toggleIsActiveCss } from "./toggle-is-active-css";
import { ElementSelectors, Marks } from "./enums";

// top-level app state
let editor: null | Editor = null;

window.addEventListener("DOMContentLoaded", async () => {
  editor = createEditor();
  /**
   * Potential pattern:
   * configuration objects for menu buttons
   * [{
   * elementId
   * markName?
   * function
   * svg
   * svgTitle
   * accessibility???
   * }]
   *
   * render menu buttons in the order the objects are in
   *
   * HOWEVER, I want to re-use the same configuration for
   * all the menu types (bubble menus, etc.)
   */

  // bold setup
  const toggleBold = (editor: Editor) => {
    // set editor
    editor.chain().focus().toggleBold().run();
    toggleIsActiveCss({
      elementSelector: ElementSelectors.ButtonBold,
      markName: Marks.Bold,
      editor,
    });
  };
  const boldButton = document.createElement("button");
  boldButton.className = "menu-button-bold"; // todo: figure out a good abstraction for this with the enums. Potentially build them up from a single const?
  boldButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Bold</title>
      <path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z"></path>
    </svg>
    `;
  boldButton.onclick = () => editor && toggleBold(editor);

  /**
   * Creates new instances of h1 buttons using
   * an editor instance.
   * All menus require separate button instances
   */
  const createH1Button = (editor: Editor) => {
    const setH1 = (editor: Editor) => {
      // set editor
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      toggleIsActiveCss({
        elementSelector: ".menu-button-h1",
        markName: "heading",
        editor,
      });
    };

    const heading1 = document.createElement("button");
    heading1.className = "menu-button-h1";
    heading1.innerText = "h1";
    heading1.onclick = () => editor && setH1(editor);

    return heading1;
  };

  const buttons = [boldButton, createH1Button(editor)];

  const editorMenuElement = document.querySelector("#editor-menu");

  // must have separate instances of whatever button is in a floating menu.
  // ie, each menu has its own button instance is the rule
  const floatingH1 = createH1Button(editor);

  // TODO: figure out a better place for handling these events
  // floatingMenu buttons need to be appended in the event for showing
  window.addEventListener("floating-menu-shown", () => {
    const floatingEditorMenu = document.querySelector("#editor-floating-menu");
    if (floatingEditorMenu) floatingEditorMenu.appendChild(floatingH1);
  });

  if (editorMenuElement)
    buttons.forEach((button) => {
      editorMenuElement.appendChild(button);
    });
});
