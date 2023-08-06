/**
 * TODO PRIORITY ORDER
 * - UI/UX polish
 *   - button css animation (fade background, z-index)
 *   - sidebar list. Underline instead of highligh?
 *   - buttons with icons need centering
 *   - stretch: re-sizable side-bar + collapsible
 *   - stretch: collapsible top-menu
 *   - save notification (could be as simple as a timestamp of last saved at top of editor)
 *   - error notification
 *   - delete confirmation
 *   - floating menu button grouping
 * - clean-up old todos
 * - code-wise: Note and FileEntry decide on Title or Name for the note
 * - potentially setup basic shortcuts (outside of tiptap)? Ie, cmd+s to save, visually indicator for saving was successful. Ie last saved timestamp
 * - need a visual way of showing what shortcuts are available. Maybe in an Edit menu? like in VS code?
 */
import { Note } from "./api/interfaces";
import {
  initializeFileStructure,
  getNotes,
  writeNote,
  deleteNote,
  readNote,
} from "./api";
import { renderEditor } from "./renderer/editor";
import {
  renderClient,
  renderGetStarted,
  renderSidebarNoteList,
} from "./renderer";

// top-level app state (keep as small as possible)
let selectedNote: null | Note = null;

/**
 * All events related to the different app life-cycles
 */
window.addEventListener("refresh-client", async () => {
  const notes = await getNotes();
  if (!selectedNote) {
    // TODO: this should get based on timestamp of last saved
    const { name, path } = notes[notes.length - 1];
    selectedNote = { name, path };
  }
  await refreshClient(notes, selectedNote);
});

window.addEventListener("create-note", async (event) => {
  const { title, content = "" } = (event as CustomEvent)?.detail?.note;
  const { note } = await writeNote(title, content);
  selectedNote = note;
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("save-note", async (event) => {
  if (!selectedNote?.name) throw new Error("No note selected to save");
  const { content } = (event as CustomEvent)?.detail?.note;
  await writeNote(selectedNote?.name, content);
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("delete-note", async (event) => {
  const { path } = (event as CustomEvent)?.detail?.note;
  await deleteNote(path);
  selectedNote = null; // reset selected note as it was deleted. You can only delete selected notes
  dispatchEvent(new Event("refresh-client"));
});

window.addEventListener("select-note", (event) => {
  const { title, path } = (event as CustomEvent)?.detail?.note;
  selectedNote = { name: title, path };
  dispatchEvent(new Event("refresh-client"));
});

/**
 * All events related to running the app have been created.
 * Initial file structure state has been setup.
 * The DOM has loaded.
 * Can be sure by this point the client is ready to render.
 */
window.addEventListener("DOMContentLoaded", async () => {
  await initializeFileStructure(); // TODO: needs to happen in the rust backend before DOM CONTENT LOADED
  // TODO:
  // ideally, by this point, we do not call refresh-client
  // but the backend will have already fetched data.
  // so we just need to render the client
  //
  // so then there are two life-cycles:
  // 1. initial load (here, DOMContentLoaded)
  // 2. any update (note here, but refresh-client event)
  dispatchEvent(new Event("refresh-client"));
});

/**
 * Main app lifecycle function.
 * Renders the stateless client
 * then decides what to render based on passed-in note state
 */
async function refreshClient(notes: Note[], selectedNote: Note): Promise<void> {
  // render stateless components
  const {
    sidebarElement,
    editorElement,
    editorTopMenuElement,
    editorFloatingMenuElement,
  } = renderClient();
  // Set main element content based on note state
  if (!notes.length) {
    renderGetStarted(editorElement);
    return;
  }
  // notes exist, render state-based components
  renderSidebarNoteList(sidebarElement, notes);
  const editor = await renderEditor({
    selectedNote,
    editorElement: editorElement,
    topEditorMenu: editorTopMenuElement,
    floatingEditorMenu: editorFloatingMenuElement,
  });
  // set editor content to the selected note
  const content = await readNote(selectedNote?.path);
  editor.commands.setContent(content);
  toggleActiveClass(
    `#${selectedNote.name}-note-select-container`,
    "select-note"
  );
  // reset editor scroll position
  editorElement.scrollTop = 0;
  // focus on editor
  editor.commands.focus("start");
}

function toggleActiveClass(selector: string, type: string) {
  const activeType = `${type}-active`;
  // remove any active classes
  const elementsToClear = document.querySelectorAll(`.${activeType}`);
  elementsToClear?.forEach((element) => {
    element.classList.remove(activeType);
  });
  // assign activeType to selector
  const elementToActivate = document.querySelector(selector);
  elementToActivate?.classList.add(activeType);
}
