import { createEvent } from "event";
import { renderButton } from "components";
import "./sidebar-top-menu.css";

/**
 * Renders sidebar without note state: only the title and create note functionality
 */
function renderSidebarTopMenu(sidebarContainer: Element): void {
  sidebarContainer.appendChild(
    renderButton({
      title: "Create note",
      onClick: () => renderNoteInput(sidebarContainer),
      html: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <title>Create note</title>
          <path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 11V8H13V11H16V13H13V16H11V13H8V11H11Z"></path>
        </svg>
        <span>Create<span/>
      `,
    })
  );
}

// TODO
// make this input be create/edit based on
// if a note is passed in. If a note is passed in,
// then we're in the edit state
// otherwise, we're in the create state

/**
 * Renders the note input used only by the sidebar (currently).
 */
function renderNoteInput(parentContainer: Element) {
  const checkForAlreadyRenderedInput = () => {
    const isInputAlreadyRendered = document.querySelector(`.${containerClass}`);
    if (isInputAlreadyRendered) {
      isInputAlreadyRendered.remove();
      return;
    }
  };
  const containerClass = "create-note-input-container";
  checkForAlreadyRenderedInput();
  const input = `
      <div class="${containerClass}">
        <input class="note-input" title="Input note title" placeholder="Note title" />
      </div>
    `;
  parentContainer.insertAdjacentHTML("beforeend", input);
  const inputContainer = document.querySelector(`.${containerClass}`);
  const noteInputClass = "note-input";

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "note-input-buttons";

  inputContainer?.appendChild(buttonContainer);

  // add the create button to the input container
  buttonContainer?.appendChild(
    renderButton({
      title: "Save note",
      html: "Save",
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
  buttonContainer?.appendChild(
    renderButton({
      title: "Cancel creating",
      html: "Cancel",
      onClick: checkForAlreadyRenderedInput,
    })
  );

  const inputElement = document.querySelector(
    `.${noteInputClass}`
  ) as HTMLElement;

  inputElement?.focus();
}

export { renderSidebarTopMenu };
