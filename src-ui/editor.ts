import { Editor } from "@tiptap/core";
// TODO
// once I have a good structure and idea of what I want
// remove starter-kit and install individual packages;
// will be more efficient and easier to manage
import StarterKit from "@tiptap/starter-kit";
import { toggleIsActiveCss } from "./toggle-is-active-css";
import { ElementSelectors, Marks } from "./enums";
import FloatingMenu from "@tiptap/extension-floating-menu";
import { getMostRecentNote } from "./api";

async function createEditor(): Promise<Editor> {
  const editorLocation = document.querySelector("#editor");
  const floatingEditorMenu = document.querySelector("#editor-floating-menu");
  if (!editorLocation || !floatingEditorMenu)
    throw Error("A required Editor element is missing");

  const floatingMenuEvent = new Event("floating-menu-shown");

  const content = (await getMostRecentNote()) ?? "<p>No content read</p>";

  return new Editor({
    element: editorLocation,
    extensions: [
      StarterKit,
      FloatingMenu.configure({
        element: floatingEditorMenu as HTMLElement,
        shouldShow: ({ editor, view }) => {
          const shouldShow =
            view.state.selection.$head.node().content.size === 0
              ? editor.isActive("paragraph")
              : false;
          if (shouldShow) dispatchEvent(floatingMenuEvent);
          return shouldShow;
        },
      }),
    ],
    content,
    onTransaction: ({ editor }) => {
      /**
       * onTransaction is being used to track
       * cursor state and toggle active css for
       * menu buttons
       */

      // get any marks at the current location
      const marksAtCursorLocation =
        editor.state.selection.$head.marks() || editor.state.storedMarks;

      // disable all active css if no marks at current location
      if (!marksAtCursorLocation.length) {
        // calling toggle to ensure latest state
        toggleIsActiveCss({
          elementSelector: ElementSelectors.ButtonBold,
          markName: Marks.Bold,
          editor,
        });
        toggleIsActiveCss({
          elementSelector: ".menu-button-h1",
          markName: "heading",
          editor,
        });
      }

      marksAtCursorLocation.forEach(({ type: { name } }) => {
        if (name === Marks.Bold) {
          toggleIsActiveCss({
            elementSelector: ElementSelectors.ButtonBold,
            markName: Marks.Bold,
            editor,
          });
        }
      });
    },
  });
}

export { createEditor };
