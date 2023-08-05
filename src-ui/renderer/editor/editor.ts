import { BUTTON_CONFIGURATION } from "./editor-buttons";
import { Editor } from "@tiptap/core";
import FloatingMenu from "@tiptap/extension-floating-menu";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Heading from "@tiptap/extension-heading";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";

async function createEditor({
  editorElement,
  floatingEditorMenu,
}: {
  editorElement: Element;
  floatingEditorMenu: Element;
}): Promise<Editor> {
  const floatingMenuEvent = new Event("floating-menu-shown");

  return new Editor({
    element: editorElement,
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      FloatingMenu.configure({
        element: floatingEditorMenu as HTMLElement,
        shouldShow: ({ editor, view }) => {
          // TODO: this is where I should change the code
          // to make the floating editor menu show whenever there is a new line
          //
          // seems to be setup incorrectly for the first render of the menu.
          // then it works every time
          const shouldShow =
            view.state.selection.$head.node().content.size === 0
              ? editor.isActive("paragraph")
              : false;
          if (shouldShow) dispatchEvent(floatingMenuEvent);
          return shouldShow;
        },
      }),
      Heading,
      BulletList,
      ListItem,
      OrderedList,
    ],
    content: "<p>Issue selecting note</p>",
    onTransaction: ({ editor }) => {
      /**
       * onTransaction tracks cursor position
       * and is used to toggle active css for each button
       */
      BUTTON_CONFIGURATION.forEach(({ className, markName, markOptions }) => {
        if (!className) return;
        toggleActiveEditorClass({
          className,
          markName: markName ?? "",
          markOptions,
          editor,
        });
      });
    },
  });
}

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
  className,
  markName,
  markOptions,
  editor,
}: {
  className: string;
  markName: string;
  markOptions?: { level: number };
  editor: Editor;
}): void {
  const elements = document.querySelectorAll(`.${className}`);
  if (!elements.length) return;
  elements.forEach((element) => {
    editor.isActive(markName, markOptions && markOptions)
      ? element.classList.add("isActive")
      : element.classList.remove("isActive");
  });
}

export { createEditor };
