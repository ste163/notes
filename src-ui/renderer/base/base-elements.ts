import { renderSidebarTopMenu } from "./sidebar-top-menu";
import { renderSidebarNoteList } from "./sidebar-note-list";
import { renderFooter } from "./footer";
import type { Note } from "types";

/**
 * Render the stateless HTML structure for the application.
 * Returns the base elements for selecting
 */
function renderBaseElements(notes: Record<string, Note>) {
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
    <div id="sidebar">
      <div id="sidebar-top-menu"></div>
    </div>
    <main>
      <div id="editor-top-menu"></div>
      <div id="editor-floating-menu"></div>
      <div id="editor"></div>
    </main>
    <footer></footer>
    `;
  const sidebarElement = document.querySelector("#sidebar");
  const sidebarTopMenuElement = document.querySelector("#sidebar-top-menu");
  const footerElement = document.querySelector("footer");
  const editorTopMenuElement = document.querySelector("#editor-top-menu");
  const editorFloatingMenuElement = document.querySelector(
    "#editor-floating-menu"
  );
  const editorElement = document.querySelector("#editor");

  if (
    !sidebarElement ||
    !sidebarTopMenuElement ||
    !footerElement ||
    !editorTopMenuElement ||
    !editorFloatingMenuElement ||
    !editorElement
  )
    throw new Error("Missing required HTML elements");

  renderSidebarTopMenu(sidebarTopMenuElement);
  renderSidebarNoteList(sidebarElement, notes);
  renderFooter(footerElement);

  return {
    sidebarElement,
    sidebarTopMenuElement,
    editorElement,
    editorTopMenuElement,
    editorFloatingMenuElement,
  };
}

export { renderBaseElements };
