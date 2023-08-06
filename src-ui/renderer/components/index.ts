/**
 * Renders configurations for button components
 */
import { Editor } from "@tiptap/core";
import { renderButton } from "./button";
import { createEvent } from "../../events";

function renderSaveButton(editor: Editor) {
  return renderButton({
    title: "Save note",
    onClick: () =>
      editor &&
      createEvent("save-note", {
        note: { content: editor.getHTML() },
      }).dispatch(),
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Save note</title>  
        <path d="M7 19V13H17V19H19V7.82843L16.1716 5H5V19H7ZM4 3H17L21 7V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM9 15V19H15V15H9Z"></path>
      </svg>`,
  });
}

function renderDeleteButton(path: string) {
  return renderButton({
    title: "Delete note",
    onClick: () =>
      path && createEvent("delete-note", { note: { path } }).dispatch(),
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Delete note</title>
        <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM13.4142 13.9997L15.182 15.7675L13.7678 17.1817L12 15.4139L10.2322 17.1817L8.81802 15.7675L10.5858 13.9997L8.81802 12.232L10.2322 10.8178L12 12.5855L13.7678 10.8178L15.182 12.232L13.4142 13.9997ZM9 4V6H15V4H9Z"></path>
      </svg>`,
  });
}

function renderUndoButton(editor: Editor) {
  return renderButton({
    title: "Undo",
    onClick: () => editor && editor.chain().focus().undo().run(),
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Undo</title>
        <path d="M5.82843 6.99955L8.36396 9.53509L6.94975 10.9493L2 5.99955L6.94975 1.0498L8.36396 2.46402L5.82843 4.99955H13C17.4183 4.99955 21 8.58127 21 12.9996C21 17.4178 17.4183 20.9996 13 20.9996H4V18.9996H13C16.3137 18.9996 19 16.3133 19 12.9996C19 9.68584 16.3137 6.99955 13 6.99955H5.82843Z"></path>
      </svg>
    `,
  });
}

function renderRedoButton(editor: Editor) {
  return renderButton({
    title: "Redo",
    onClick: () => editor && editor.chain().focus().redo().run(),
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Redo</title>
        <path d="M18.1716 6.99955L15.636 9.53509L17.0502 10.9493L22 5.99955L17.0502 1.0498L15.636 2.46402L18.1716 4.99955H11C6.58172 4.99955 3 8.58127 3 12.9996C3 17.4178 6.58172 20.9996 11 20.9996H20V18.9996H11C7.68629 18.9996 5 16.3133 5 12.9996C5 9.68584 7.68629 6.99955 11 6.99955H18.1716Z"></path>
      </svg>
    `,
  });
}

export {
  renderButton,
  renderSaveButton,
  renderDeleteButton,
  renderUndoButton,
  renderRedoButton,
};
