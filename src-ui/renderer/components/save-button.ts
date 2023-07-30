import { Editor } from "@tiptap/core";

function renderSaveButton(editor: Editor) {
  const saveButton = document.createElement("button");
  saveButton.title = "Save note";
  saveButton.onclick = () => editor && emitSaveNote(editor.getHTML());
  saveButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>Save note</title>  
            <path d="M7 19V13H17V19H19V7.82843L16.1716 5H5V19H7ZM4 3H17L21 7V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM9 15V19H15V15H9Z"></path>
        </svg>`;
  return saveButton;
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

export { renderSaveButton };
