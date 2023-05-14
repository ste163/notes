import { Editor } from "@tiptap/core";
// instead of using the starter kit, grab the exact extensions that i want to use
import StarterKit from "@tiptap/starter-kit";

function createEditor(): void {
  const editorLocation = document.querySelector("#editor");
  if (!editorLocation) throw Error("Editor location not found");
  new Editor({
    element: editorLocation,
    extensions: [StarterKit],
    content: "<p>Hello World!</p>", // ideally would load last opened file contents
  });
}

export { createEditor };
