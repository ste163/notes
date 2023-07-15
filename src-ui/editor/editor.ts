import { Editor } from "@tiptap/core";
// TODO
// once I have a good structure and idea of what I want
// remove starter-kit and install individual packages;
// will be more efficient and easier to manage
import StarterKit from "@tiptap/starter-kit";
import { toggleActiveEditorClass } from "./toggle-active-editor-class";
import { ElementSelectors, Marks } from "../enums";
import FloatingMenu from "@tiptap/extension-floating-menu";
import { readNote } from "../api";

async function setEditorContent(editor: Editor, path: string) {
  const content = await readNote(path);
  editor.commands.setContent(content);
}

async function createEditor({
  editorElement,
  floatingEditorMenu,
}: {
  editorElement: Element;
  floatingEditorMenu: Element;
}): Promise<Editor> {
  // todo: think about a non-hard-coded approach for event naming
  // however, if it's so few. YAGNI.
  const floatingMenuEvent = new Event("floating-menu-shown");

  return new Editor({
    element: editorElement,
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
    content: "<p>Issue selecting note</p>",
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
        toggleActiveEditorClass({
          elementSelector: ElementSelectors.ButtonBold,
          markName: Marks.Bold,
          editor,
        });
        toggleActiveEditorClass({
          elementSelector: ".menu-button-h1",
          markName: "heading",
          editor,
        });
      }

      marksAtCursorLocation.forEach(({ type: { name } }) => {
        if (name === Marks.Bold) {
          toggleActiveEditorClass({
            elementSelector: ElementSelectors.ButtonBold,
            markName: Marks.Bold,
            editor,
          });
        }
      });
    },
  });
}

export { createEditor, setEditorContent };
