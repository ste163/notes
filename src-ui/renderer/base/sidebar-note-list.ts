import type { Note } from "../../types";
import { createEvent } from "../../events";
import { renderButton } from "../components";

/**
 * Renders the note list that can
 * - emit note sort order event
 * - emit select note event
 * - emit delete note event
 */
function renderSidebarNoteList(
  sidebarElement: Element,
  notes: Record<string, Note>
) {
  // TODO: sort the note list based on the sort order state from the event
  const noteList = Object.values(notes);

  if (noteList?.length) renderSortNote(sidebarElement);

  noteList?.map(({ _id, title, updatedAt }) => {
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

// does not need to live in note-list
function renderSortNote(sidebarElement: Element) {
  // create a html select input with the options of
  // alphabetical, last updated
  const options = ["alphabetical", "last updated"];
  const selectInput = document.createElement("select");

  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.text = option;
    selectInput.appendChild(optionElement);
  });

  selectInput.addEventListener("change", (event: any | Event) => {
    createEvent("sort-notes", { sort: event?.target?.value }).dispatch();
  });

  // Append select input to the sidebarElement
  sidebarElement.appendChild(selectInput);
}

export { renderSidebarNoteList };
