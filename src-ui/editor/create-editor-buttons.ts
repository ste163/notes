import { Editor } from "@tiptap/core";

/**
 * TODO:
 * figure out the pattern once enough buttons, of every type
 * have been created.
 *
 * Potential pattern?:
 * configuration objects for menu buttons
 * [{
 * elementId
 * markName?
 * function
 * svg
 * svgTitle??
 * accessibility???
 * }]
 *
 * render menu buttons in the order the objects are in
 *
 * HOWEVER, I want to re-use the same configuration for
 * all the menu types (bubble menus, etc.)
 */

function createSaveButton(editor: Editor) {
  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.onclick = () => editor && emitSaveNote(editor.getHTML());
  return saveButton;
}

function createBoldButton(editor: Editor) {
  const setBold = (editor: Editor) => {
    editor.chain().focus().toggleBold().run();
  };

  const boldButton = document.createElement("button");
  boldButton.className = "menu-button-bold"; // todo: consider an abstraction for className strings. Potentially build them up from a single const?
  boldButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Bold</title>
      <path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z"></path>
    </svg>
  `;
  boldButton.onclick = () => editor && setBold(editor);

  return boldButton;
}

/**
 * Creates new instances of h1 buttons using
 * an editor instance.
 * All menus require separate button instances
 */
function createH1Button(editor: Editor) {
  const setH1 = (editor: Editor) => {
    editor.chain().focus().toggleHeading({ level: 1 }).run();
  };

  const heading1 = document.createElement("button");
  heading1.className = "menu-button-h1";
  heading1.innerText = "h1";
  heading1.onclick = () => editor && setH1(editor);

  return heading1;
}

function createH2Button(editor: Editor) {
  const setH2 = (editor: Editor) => {
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  };

  const heading2 = document.createElement("button");
  heading2.className = "menu-button-h2";
  heading2.innerText = "h2";
  heading2.onclick = () => editor && setH2(editor);

  return heading2;
}

function emitSaveNote(content: string) {
  const event = new CustomEvent("save-note", {
    detail: {
      note: {
        content,
      },
    },
  });
  dispatchEvent(event);
}

/**
 * Instantiates all top menu bar buttons
 */
function createTopMenuButtons(editor: Editor) {
  return [
    createSaveButton(editor),
    createBoldButton(editor),
    createH1Button(editor),
    createH2Button(editor),
  ];
}

/**
 * Instantiates all floating menu buttons
 */
function createFloatingMenuButtons(editor: Editor) {
  return [createH1Button(editor), createH2Button(editor)];
}

export { createTopMenuButtons, createFloatingMenuButtons };
