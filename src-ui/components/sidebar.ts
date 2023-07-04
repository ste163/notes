/**
 * Main render function for base sidebar
 */
function renderSidebar(sidebarContainer: Element): void {
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
  saveButton.onclick = createNote;

  const inputContainer = document.querySelector(".create-note-input-container");
  inputContainer?.appendChild(saveButton);

  const inputElement = document.querySelector(".note-input") as HTMLElement;
  inputElement?.focus();
}

/**
 * Read input value and emit create-note event
 */
function createNote() {
  // TODO: refactor to only be the emit.
  // need to pass in the title
  // and remove content: "" as it's not needed
  const input = document.querySelector(".note-input") as HTMLInputElement;
  const title: string = input?.value;
  if (!title) throw new Error("Unable to read title from input");
  const createNoteEvent = new CustomEvent("create-note", {
    detail: {
      note: {
        title,
        content: "",
      },
    },
  });
  window.dispatchEvent(createNoteEvent);
}

export { renderSidebar };
