import { createEvent } from "../events";
import { renderButton } from "./components";
import { renderFooter } from "./footer";

/**
 * Render the stateless HTML structure for the application.
 * Returns the base elements for selecting
 */
function renderClient() {
  const body = document.querySelector("body");
  if (!body) throw new Error("Body Element not found. Exit client scaffolding");
  body.innerHTML = `
    <div id="modal-backdrop" tabindex="-1" readonly="readonly">
      <div id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1" readonly="readonly">
        <div role="document">
          <header id="modal-header">
            <h2 id="modal-title"> Title</h2>
            <button id="modal-close">X</button>
          </header>
          <div id="modal-content"></div>
        </div>
      </div>
    </div>
    <div id="sidebar"></div>
    <main>
      <div id="editor-top-menu"></div>     
      <div id="editor-floating-menu"></div>
      <div id="editor"></div>
    </main>
    <footer></footer>
    `;
  const sidebarElement = document.querySelector("#sidebar");
  const footerElement = document.querySelector("footer");
  const editorTopMenuElement = document.querySelector("#editor-top-menu");
  const editorFloatingMenuElement = document.querySelector(
    "#editor-floating-menu"
  );
  const editorElement = document.querySelector("#editor");

  if (
    !sidebarElement ||
    !footerElement ||
    !editorTopMenuElement ||
    !editorFloatingMenuElement ||
    !editorElement
  )
    throw new Error("Missing required HTML elements");

  renderSidebar(sidebarElement);
  renderFooter(footerElement);

  return {
    sidebarElement,
    editorElement,
    editorTopMenuElement,
    editorFloatingMenuElement,
  };
}

/**
 * Renders sidebar without note state: only the title and create note functionality
 */
function renderSidebar(sidebarContainer: Element): void {
  sidebarContainer.appendChild(
    renderButton({
      title: "Create note",
      text: "Create",
      onClick: () => renderNoteInput(sidebarContainer),
      icon: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Create note</title>
      <path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 11V8H13V11H16V13H13V16H11V13H8V11H11Z"></path>
    </svg>`,
    })
  );
}

/**
 * Renders the note input used only by the sidebar (currently).
 */
function renderNoteInput(sidebarContainer: Element) {
  const containerClass = "create-note-input-container";
  const isInputAlreadyRendered = document.querySelector(`.${containerClass}`);
  if (isInputAlreadyRendered) return;
  const input = `
    <div class="${containerClass}">
      <input class="note-input" title="Input note filename title" placeholder="note-title" />
    </div>
  `;
  sidebarContainer.insertAdjacentHTML("beforeend", input);
  const inputContainer = document.querySelector(`.${containerClass}`);
  const noteInputClass = "note-input";
  // add the save/create button to the input container
  inputContainer?.appendChild(
    renderButton({
      text: "Save",
      title: "Save file",
      onClick: () => {
        const input = document.querySelector(
          `.${noteInputClass}`
        ) as HTMLInputElement;
        const title: string = input?.value;
        if (!title) throw new Error("Unable to read title from input");
        createEvent("create-note", { note: { title } }).dispatch();
      },
    })
  );
  const inputElement = document.querySelector(
    `.${noteInputClass}`
  ) as HTMLElement;
  inputElement?.focus();
}

export { renderClient };
