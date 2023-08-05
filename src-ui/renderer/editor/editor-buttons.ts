import { Editor } from "@tiptap/core";
import { Button, renderButton } from "../components/button";

interface EditorButton extends Button {
  isInFloatingMenu: boolean;
  markName?: string; // used for toggling css
  markOptions?: any; // used for toggling css
}

/**
 * Configuration object for creating buttons.
 * Also used by the editor to toggle active CSS
 */
const BUTTON_CONFIGURATION: EditorButton[] = [
  {
    title: "Bold",
    markName: "bold",
    className: "menu-button-bold",
    isInFloatingMenu: false,
    onClick: (editor: Editor) => editor.chain().focus().toggleBold().run(),
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Bold</title>
        <path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z"></path>
      </svg>`,
  },
  {
    title: "Heading 1",
    markName: "heading",
    markOptions: { level: 1 },
    className: "menu-button-h1",
    isInFloatingMenu: true,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Heading 1</title>
        <path d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM21.0005 8V20H19.0005L19 10.204L17 10.74V8.67L19.5005 8H21.0005Z"></path>
      </svg>`,
  },
  {
    title: "Heading 2",
    markName: "heading",
    markOptions: { level: 2 },
    className: "menu-button-h2",
    isInFloatingMenu: true,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Heading 2</title>
        <path d="M4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 8C20.5711 8 22.25 9.67893 22.25 11.75C22.25 12.6074 21.9623 13.3976 21.4781 14.0292L21.3302 14.2102L18.0343 18H22V20H15L14.9993 18.444L19.8207 12.8981C20.0881 12.5908 20.25 12.1893 20.25 11.75C20.25 10.7835 19.4665 10 18.5 10C17.5818 10 16.8288 10.7071 16.7558 11.6065L16.75 11.75H14.75C14.75 9.67893 16.4289 8 18.5 8Z"></path>
      </svg>`,
  },
  {
    title: "Heading 3",
    markName: "heading",
    markOptions: { level: 3 },
    className: "menu-button-h3",
    isInFloatingMenu: true,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Heading 3</title>
        <path d="M22 8L21.9984 10L19.4934 12.883C21.0823 13.3184 22.25 14.7728 22.25 16.5C22.25 18.5711 20.5711 20.25 18.5 20.25C16.674 20.25 15.1528 18.9449 14.8184 17.2166L16.7821 16.8352C16.9384 17.6413 17.6481 18.25 18.5 18.25C19.4665 18.25 20.25 17.4665 20.25 16.5C20.25 15.5335 19.4665 14.75 18.5 14.75C18.214 14.75 17.944 14.8186 17.7056 14.9403L16.3992 13.3932L19.3484 10H15V8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"></path>
      </svg>`,
  },
  {
    title: "Bullet List",
    markName: "listItem",
    className: "menu-button-bullet-list",
    isInFloatingMenu: true,
    onClick: (editor: Editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Bullet List</title>
        <path d="M8 4H21V6H8V4ZM4.5 6.5C3.67157 6.5 3 5.82843 3 5C3 4.17157 3.67157 3.5 4.5 3.5C5.32843 3.5 6 4.17157 6 5C6 5.82843 5.32843 6.5 4.5 6.5ZM4.5 13.5C3.67157 13.5 3 12.8284 3 12C3 11.1716 3.67157 10.5 4.5 10.5C5.32843 10.5 6 11.1716 6 12C6 12.8284 5.32843 13.5 4.5 13.5ZM4.5 20.4C3.67157 20.4 3 19.7284 3 18.9C3 18.0716 3.67157 17.4 4.5 17.4C5.32843 17.4 6 18.0716 6 18.9C6 19.7284 5.32843 20.4 4.5 20.4ZM8 11H21V13H8V11ZM8 18H21V20H8V18Z"></path>
      </svg>`,
  },
  {
    title: "Ordered List",
    markName: "listItem", // BUG: fix conflicting names for order and unordered lists. Unable to toggle css properly
    className: "menu-button-ordered-list",
    isInFloatingMenu: true,
    onClick: (editor: Editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Ordered List</title>
        <path d="M5.75024 3.5H4.71733L3.25 3.89317V5.44582L4.25002 5.17782L4.25018 8.5H3V10H7V8.5H5.75024V3.5ZM10 4H21V6H10V4ZM10 11H21V13H10V11ZM10 18H21V20H10V18ZM2.875 15.625C2.875 14.4514 3.82639 13.5 5 13.5C6.17361 13.5 7.125 14.4514 7.125 15.625C7.125 16.1106 6.96183 16.5587 6.68747 16.9167L6.68271 16.9229L5.31587 18.5H7V20H3.00012L2.99959 18.8786L5.4717 16.035C5.5673 15.9252 5.625 15.7821 5.625 15.625C5.625 15.2798 5.34518 15 5 15C4.67378 15 4.40573 15.2501 4.37747 15.5688L4.3651 15.875H2.875V15.625Z"></path>
      </svg>
    `,
  },
];

/**
 * Reads Button Config and generates button instances
 */
function instantiateButtons(editor: Editor) {
  const topMenuButtons: HTMLButtonElement[] = [];
  const floatingMenuButtons: HTMLButtonElement[] = [];

  const renderEditorButton = (editor: Editor, button: EditorButton) => {
    return renderButton({
      title: button.title,
      icon: button.icon,
      className: button.className ?? "",
      onClick: () => editor && button.onClick(editor),
    });
  };

  BUTTON_CONFIGURATION.forEach((button: EditorButton) => {
    if (button.isInFloatingMenu) {
      floatingMenuButtons.push(renderEditorButton(editor, button));
    }
    topMenuButtons.push(renderEditorButton(editor, button));
  });

  return {
    topMenuButtons,
    floatingMenuButtons,
  };
}

export { BUTTON_CONFIGURATION, instantiateButtons };
