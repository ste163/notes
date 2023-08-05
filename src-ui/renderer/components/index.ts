import { Editor } from "@tiptap/core";
import { renderButton } from "./button";
import { createEvent } from "../../events";

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

export { renderButton, renderDeleteButton, renderSaveButton };
