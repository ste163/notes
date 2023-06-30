function renderNoteInput(sidebarContainer: Element) {
  // GOALS:
  // get the input and the save button talking to each other.
  // Do that by attaching an onclick to the save button
  // that gets the input value and shoots that to the API
  // when it saves properly, delete the input container from dom

  // will eventually need to have some input validation to ensure no characters like '.' or '/', " " (space)

  const isInputAlreadyRendered = document.querySelector(
    ".create-note-input-container"
  );
  if (isInputAlreadyRendered) return;

  const input = `
        <div class="create-note-input-container">
          <input title="Input note filename title" placeholder="note-title" />
          <button title="Save file">+</button>
        </div>
      `;

  sidebarContainer.insertAdjacentHTML("beforeend", input);
}

function renderSidebar(sidebarContainer: Element): void {
  const sidebarContent = `
        <h1>Notes</h1>
    `;

  const createButton = document.createElement("button");
  createButton.innerText = "+ Create";
  createButton.onclick = () => renderNoteInput(sidebarContainer);

  sidebarContainer.innerHTML = sidebarContent;
  sidebarContainer.appendChild(createButton);
}

export { renderSidebar };
