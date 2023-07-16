import { Editor } from "@tiptap/core";
// TODO
// once I have a good structure and idea of what I want
// remove starter-kit and install individual packages;
// will be more efficient and easier to manage
import StarterKit from "@tiptap/starter-kit";
import { toggleActiveEditorClass } from "./toggle-active-editor-class";
import FloatingMenu from "@tiptap/extension-floating-menu";

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
          // TODO: this is where I should change the code
          // to make the floating editor menu show whenever there is a new line
          //
          // seems to be setup incorrectly for the first render of the menu.
          // then it works everytime
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
       * onTransaction tracks cursor position
       * and is used to toggle active css for each button
       */

      // TODO: this should be used in create-editor-buttons
      // so that you change 1 thing in editor buttons, and everything 'just works'
      const editorElements: Array<{
        elementSelector: string;
        markName: string;
        markOptions?: any;
      }> = [
        { elementSelector: ".menu-button-bold", markName: "bold" },
        {
          elementSelector: ".menu-button-h1",
          markName: "heading",
          markOptions: { level: 1 },
        },
        {
          elementSelector: ".menu-button-h2",
          markName: "heading",
          markOptions: { level: 2 },
        },
      ];

      editorElements.forEach(({ elementSelector, markName, markOptions }) => {
        toggleActiveEditorClass({
          elementSelector: elementSelector,
          markName: markName,
          markOptions: markOptions,
          editor,
        });
      });
    },
  });
}

export { createEditor };
