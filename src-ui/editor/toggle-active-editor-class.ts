import { Editor } from "@tiptap/core";

// TODO: after doing all the buttons, if its only ever called in create-editor
// then move to create-editor

/**
 * Toggle active css state for Editor based on the given
 * elementSelector, editor instance, and mark name.
 * Always call editor.isActive as tiptap is
 * the state-manager and will always be in sync.
 * isActive checks at the current cursor position
 *
 * ie: toggleIsActiveCss({elementSelector: 'bold-button', markName: 'bold', editor: Editor})
 */
function toggleActiveEditorClass({
  elementSelector,
  markName,
  markOptions,
  editor,
}: {
  elementSelector: string;
  markName: string;
  markOptions?: { level: number };
  editor: Editor;
}): void {
  const elements = document.querySelectorAll(elementSelector);
  if (!elements.length) throw `${elementSelector} not found.`;
  elements.forEach((element) => {
    editor.isActive(markName, markOptions && markOptions)
      ? element.classList.add("isActive")
      : element.classList.remove("isActive");
  });
}

export { toggleActiveEditorClass };
