import { Editor } from "@tiptap/core";

/**
 * Toggle active css state based on the given
 * elementSelector, editor instance, and mark name.
 * Always call editor.isActive as tiptap is
 * the state-manager and will always be in sync
 *
 * ie: toggleIsActiveCss({elementSelector: 'bold-button', markName: 'bold', editor: Editor})
 */
function toggleIsActiveCss({
  elementSelector,
  markName,
  editor,
}: {
  elementSelector: string;
  markName: string;
  editor: Editor;
}): void {
  const elements = document.querySelectorAll(elementSelector);
  if (!elements.length)
    throw `${elementSelector} not found. Unable to toggle active css state`;
  elements.forEach((element) =>
    editor.isActive(markName)
      ? element.classList.add("isActive")
      : element.classList.remove("isActive")
  );
}

export { toggleIsActiveCss };
