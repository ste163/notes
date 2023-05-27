import { Editor } from "@tiptap/core";
// TODO
// once I have a good structure and idea of what I want
// remove starter-kit and install individual packages;
// will be more efficient and easier to manage
import StarterKit from "@tiptap/starter-kit";
import { toggleIsActiveCss } from "./toggle-is-active-css";

function createEditor(): Editor {
  const editorLocation = document.querySelector("#editor");
  if (!editorLocation) throw Error("Editor location not found");
  return new Editor({
    element: editorLocation,
    extensions: [StarterKit],
    content: "<p>Hello World!</p>", // ideally would load last opened file contents
    onTransaction: ({ editor }) => {
      /*
       * onTransaction is being used to track
       * cursor state and toggle active css for
       * the menu buttons
       */

      // set the active state for the buttons
      const marksAtCursorLocation =
        editor.state.selection.$head.marks() || editor.state.storedMarks;

      // cursor location does not contain marks;
      // disable all marks (potentially better not to call the toggle though)
      // but a full disable as that would potentially be more performant
      if (!marksAtCursorLocation.length) {
        toggleIsActiveCss({
          elementId: "#menu-button-bold",
          markName: "bold",
          editor,
        });
      }

      marksAtCursorLocation.forEach((mark) => {
        if (mark.type?.name === "bold") {
          toggleIsActiveCss({
            elementId: "#menu-button-bold",
            markName: "bold",
            editor,
          });
        }
      });
    },
  });
}

export { createEditor };
