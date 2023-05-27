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

      // get any marks at the current location
      const marksAtCursorLocation =
        editor.state.selection.$head.marks() || editor.state.storedMarks;

      // disable all if no marks at current location
      if (!marksAtCursorLocation.length) {
        // calling toggle to ensure latest state
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
