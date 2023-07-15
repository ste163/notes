/**
 * Main render function for base sidebar.
 * Outside of the scaffold component because sidebar
 * contains functions for rendering sidebar specific components
 * and emitting events
 */
function renderScaffoldSidebar(sidebarContainer: Element): void {
  const createButton = document.createElement("button");
  createButton.innerText = "+ Create";
  createButton.onclick = () => renderNoteInput(sidebarContainer);
  sidebarContainer.innerHTML = `
    <h1>Notes</h1>
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
