import { renderScaffoldBody } from "./scaffold-body";
import { renderScaffoldSidebar } from "./scaffold-sidebar";

function renderClient() {
  const {
    sidebarElement,
    editorElement,
    editorTopMenuElement,
    editorFloatingMenuElement,
  } = renderScaffoldBody();
  renderScaffoldSidebar(sidebarElement);

  return {
    sidebarElement,
    editorElement,
    editorTopMenuElement,
    editorFloatingMenuElement,
  };
}

export { renderClient };
// below exports are for life-cycle specific components
export { renderGetStarted } from "./get-started";
export { renderSidebarNoteList } from "./sidebar-note-list";
