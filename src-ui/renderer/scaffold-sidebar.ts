/**
 * Main render function for base sidebar.
 * Outside of the scaffold component because sidebar
 * contains functions for rendering sidebar specific components
 * and emitting events
 */
function renderScaffoldSidebar(sidebarContainer: Element): void {
  const createButton = document.createElement("button");
  createButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Create note</title>
      <path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 11V8H13V11H16V13H13V16H11V13H8V11H11Z"></path>
    </svg>`;
  createButton.title = "Create note";
  createButton.append("Create");
  createButton.onclick = () => renderNoteInput(sidebarContainer);
  sidebarContainer.innerHTML = `
    <h1>notes</h1>
  `;
  sidebarContainer.appendChild(createButton);
}

/**
 * Renders the note input used only by the sidebar.
 * Scoped to this file as it won't be used elsewhere
 */
function renderNoteInput(sidebarContainer: Element) {
  // todo:
  // will eventually need to have some input validation to ensure no characters like '.' or '/', " " (space)
  const isInputAlreadyRendered = document.querySelector(
    ".create-note-input-container"
  );
  if (isInputAlreadyRendered) return;
  const input = `
    <div class="create-note-input-container">
      <input class="note-input" title="Input note filename title" placeholder="note-title" />
    </div>
  `;

  sidebarContainer.insertAdjacentHTML("beforeend", input);

  const saveButton = document.createElement("button");
  saveButton.innerText = "+";
  saveButton.title = "Save file";
  saveButton.onclick = () => {
    const input = document.querySelector(".note-input") as HTMLInputElement;
    const title: string = input?.value;
    if (!title) throw new Error("Unable to read title from input");
    emitCreateNote(title);
  };

  const inputContainer = document.querySelector(".create-note-input-container");
  inputContainer?.appendChild(saveButton);

  const inputElement = document.querySelector(".note-input") as HTMLElement;
  inputElement?.focus();
}

function emitCreateNote(title: string) {
  const createNoteEvent = new CustomEvent("create-note", {
    detail: {
      note: {
        title,
      },
    },
  });
  window.dispatchEvent(createNoteEvent);
}

export { renderScaffoldSidebar };
