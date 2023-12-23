import type { Note } from "types";
import { createEvent } from "event";
import { renderButton } from "components";

/**
 * Renders the note list that can
 * - emit select note event
 * - emit delete note event
 */
function renderSidebarNoteList(
  sidebarElement: Element,
  notes: Record<string, Note>
) {
  Object.values(notes)?.map(({ _id, title, updatedAt }) => {
    if (!title) throw new Error("Unable to read name from note");
    const selectableNoteButton = renderButton({
      title,
      html: `
      <div>
        <div>${title}</div>
        <div class="select-note-date">${new Date(
          updatedAt
        ).toLocaleString()}</div>
      </div>`,
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
