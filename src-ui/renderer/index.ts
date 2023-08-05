import { renderScaffoldBody } from "./scaffold-body";
import { renderScaffoldSidebar } from "./scaffold-sidebar";

// TODO: rethink this scaffolding approach
// its confusing and doesn't include the idea of where notes live
// Ideally, renderClient would have notes passed in
// so that it can actually render based on state
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
