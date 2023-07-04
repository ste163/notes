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
    if (!name) throw new Error("Unable to read name from note");
    const selectableNote = document.createElement("button");
    selectableNote.innerText = name;
    selectableNote.onclick = () => selectNote(name, path);
    selectableNote.id = name; // TODO: should probably be an id as it needs to follow selector rules
    // otherwise, I need to heavily restrict characters (which might be best anyway as its a filesystem setup)

    const noteSelectContainer = document.createElement("div");
    noteSelectContainer.classList.add("note-select-container");
    noteSelectContainer.id = `${name}-note-select-container`;

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "X";
    deleteButton.onclick = async () => {
      // TODO: this CAN NOT do a delete here. HUGE PROBLEM.
      // MUST emit the event and index.ts handles the mutation
      await deleteNote(path);
      const refreshEvent = new Event("refresh-client");
      dispatchEvent(refreshEvent);
    };

    noteSelectContainer.appendChild(selectableNote);
    noteSelectContainer.appendChild(deleteButton);

    sidebarElement.append(noteSelectContainer);
  });
}

function selectNote(title: string, path: string) {
  const selectNoteEvent = new CustomEvent("note-selected", {
    detail: {
      note: {
        title,
        path,
      },
    },
  });
  dispatchEvent(selectNoteEvent);
}

export { renderSidebarNoteList };
