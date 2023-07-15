import { renderScaffoldBody } from "./scaffold-body";
import { renderScaffoldSidebar } from "./scaffold-sidebar";

function renderClient() {
  const {
    sidebarElement,
    editorElement,
    editorMenuElement,
    editorFloatingMenuElement,
  } = renderScaffoldBody();
  renderScaffoldSidebar(sidebarElement);

  return {
    sidebarElement,
    editorElement,
    editorMenuElement,
    editorFloatingMenuElement,
  };
}

export { renderClient };
export { renderGetStarted } from "./get-started";
export { renderSidebarNoteList } from "./sidebar-note-list";
