// TODO: create a Note interface to remove the use
// of importing Tauri. The client should have NO idea
// what tauri is
import { FileEntry } from "@tauri-apps/api/fs";
import { deleteNote } from "../api";

/**
 * Renders the note list that can
 * - select a note and set editor state
 * - delete note and emit refresh event
 */
function renderSidebarNoteList(sidebarElement: Element, notes: FileEntry[]) {
  notes.map(({ name, path }) => {
    const selectableNote = document.createElement("button");
    selectableNote.innerText = name ?? "unable to read name";
    selectableNote.onclick = () => selectNote(path);
    selectableNote.id = path; // path will always be unique, so I can identify the active note

    const notePickerContainer = document.createElement("div");
    notePickerContainer.classList.add("note-picker-container");

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "X";
    deleteButton.onclick = async () => {
      await deleteNote(path);
      const refreshEvent = new Event("refresh-client");
      dispatchEvent(refreshEvent);
    };

    notePickerContainer.appendChild(selectableNote);
    notePickerContainer.appendChild(deleteButton);

    sidebarElement.append(notePickerContainer);
  });
}

function selectNote(path: string) {
  const selectNoteEvent = new CustomEvent("note-selected", {
    detail: {
      note: {
        path,
      },
    },
  });
  dispatchEvent(selectNoteEvent);
}

export { renderSidebarNoteList };
