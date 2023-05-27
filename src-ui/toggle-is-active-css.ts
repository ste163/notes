import { Editor } from "@tiptap/core";

/**
 * Toggle active css state based on the given
 * elementId, editor instance, and mark name.
 * Always call editor.isActive as tiptap is
 * the state-manager and will always be in sync
 *
 * ie: toggleIsActiveCss({elementId: 'bold-button', markName: 'bold', editor: Editor})
 */
function toggleIsActiveCss({
  elementId,
  markName,
  editor,
}: {
  elementId: string;
  markName: string;
  editor: Editor;
}): void {
  const element = document.querySelector(elementId);
  if (!element) return;
  editor.isActive(markName)
    ? (element.className = "isActive")
    : (element.className = "");
}

export { toggleIsActiveCss };
