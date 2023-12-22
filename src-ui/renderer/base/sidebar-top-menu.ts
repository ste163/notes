import { renderButton } from "../components";
import { createEvent } from "../../events";

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

/**
 * Renders the note input used only by the sidebar (currently).
 */
function renderNoteInput(sidebarContainer: Element) {
  const containerClass = "create-note-input-container";
  const isInputAlreadyRendered = document.querySelector(`.${containerClass}`);
  if (isInputAlreadyRendered) {
    isInputAlreadyRendered.remove();
    return;
  }
  const input = `
      <div class="${containerClass}">
        <input class="note-input" title="Input note title" placeholder="Note title" />
      </div>
    `;
  sidebarContainer.insertAdjacentHTML("beforeend", input);
  const inputContainer = document.querySelector(`.${containerClass}`);
  const noteInputClass = "note-input";
  // add the save/create button to the input container
  inputContainer?.appendChild(
    renderButton({
      title: "Save file",
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
  const inputElement = document.querySelector(
    `.${noteInputClass}`
  ) as HTMLElement;
  inputElement?.focus();
}

export { renderSidebarTopMenu };
