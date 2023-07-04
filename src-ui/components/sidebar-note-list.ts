// TODO: create a Note interface to remove the use
// of importing Tauri. The client should have NO idea
// what tauri is
import { FileEntry } from "@tauri-apps/api/fs";
import { emitSelectedNote } from "../event-emitters";

/**
 * Renders the note list that can
 * - select a note and set editor state
 * - delete note and emit refresh event
 */
function renderSidebarNoteList(sidebarElement: Element, notes: FileEntry[]) {
  notes.map(({ name, path }) => {
    if (!name) throw new Error("Unable to read name from note");
    const selectableNote = document.createElement("button");
    selectableNote.innerText = name;
    selectableNote.onclick = () => emitSelectedNote(name, path);
    selectableNote.id = name; // TODO: should probably be an id as it needs to follow selector rules
    // otherwise, I need to heavily restrict characters (which might be best anyway as its a filesystem setup)

    const noteSelectContainer = document.createElement("div");
    noteSelectContainer.classList.add("note-select-container");
    noteSelectContainer.id = `${name}-note-select-container`;

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "X";
    deleteButton.onclick = () => deleteNote(path);

    noteSelectContainer.appendChild(selectableNote);
    noteSelectContainer.appendChild(deleteButton);

    sidebarElement.append(noteSelectContainer);
  });
}

function deleteNote(path: string) {
  const deleteNoteEvent = new CustomEvent("delete-note", {
    detail: {
      note: {
        path,
      },
    },
  });
  dispatchEvent(deleteNoteEvent);
}

export { renderSidebarNoteList };
