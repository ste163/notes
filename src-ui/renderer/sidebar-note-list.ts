import { Db_Note } from "../db";
import { createEvent } from "../events";
import { renderButton } from "./components";

/**
 * Renders the note list that can
 * - select a note and set editor state
 * - delete note and emit refresh event
 */
function renderSidebarNoteList(
  sidebarElement: Element,
  notes: Record<string, Db_Note>
) {
  Object.values(notes).map(({ title, _id }) => {
    if (!title) throw new Error("Unable to read name from note");
    const selectableNoteButton = renderButton({
      title,
      text: title,
      onClick: () =>
        createEvent("select-note", { note: { id: _id } }).dispatch(),
    });
    selectableNoteButton.id = _id;
    const noteSelectContainer = document.createElement("div");
    const containerClass = "note-select-container";
    noteSelectContainer.classList.add(containerClass);
    noteSelectContainer.id = `${_id}-${containerClass}`;
    noteSelectContainer.appendChild(selectableNoteButton);
    sidebarElement.append(noteSelectContainer);
  });
}

export { renderSidebarNoteList };
