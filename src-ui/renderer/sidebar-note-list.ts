import { Note } from "../api/interfaces";
import { emitSelectedNote } from "../events";
import { renderButton } from "./components";

/**
 * Renders the note list that can
 * - select a note and set editor state
 * - delete note and emit refresh event
 */
function renderSidebarNoteList(sidebarElement: Element, notes: Note[]) {
  notes.map(({ name, path }) => {
    if (!name) throw new Error("Unable to read name from note");
    const selectableNoteButton = renderButton({
      text: name,
      title: name,
      onClick: () => emitSelectedNote(name, path),
    });
    selectableNoteButton.id = name; // TODO: should probably be an id as it needs to follow selector rules
    // otherwise, I need to heavily restrict characters (which might be best anyway as its a filesystem setup)
    const noteSelectContainer = document.createElement("div");
    noteSelectContainer.classList.add("note-select-container");
    noteSelectContainer.id = `${name}-note-select-container`;
    noteSelectContainer.appendChild(selectableNoteButton);
    sidebarElement.append(noteSelectContainer);
  });
}

export { renderSidebarNoteList };
