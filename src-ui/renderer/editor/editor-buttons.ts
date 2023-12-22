import { Editor } from "@tiptap/core";
import { Button, renderButton } from "../components/button";
import { createEvent } from "../../events";
import { renderModal } from "../components/modal";

interface EditorButton extends Button {
  group: number; // used for placing in which div for organization
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
    group: 1,
    title: "Bold",
    markName: "bold",
    className: "menu-button-bold",
    isInFloatingMenu: false,
    onClick: (editor: Editor) => editor.chain().focus().toggleBold().run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Bold</title>
        <path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z"></path>
      </svg>`,
  },
  {
    group: 1,
    title: "Italic",
    markName: "italic",
    className: "menu-button-italic",
    isInFloatingMenu: false,
    onClick: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Italic</title>
      <path d="M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z"></path>
    </svg>
    `,
  },
  {
    group: 1,
    title: "Underline",
    markName: "underline",
    className: "menu-button-underline",
    isInFloatingMenu: false,
    onClick: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Underline</title>
      <path d="M8 3V12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12V3H18V12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12V3H8ZM4 20H20V22H4V20Z"></path>
    </svg>
    `,
  },
  {
    group: 1,
    title: "Strike",
    markName: "strike",
    className: "menu-button-strike",
    isInFloatingMenu: false,
    onClick: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Strike-through</title>
      <path d="M17.1538 14C17.3846 14.5161 17.5 15.0893 17.5 15.7196C17.5 17.0625 16.9762 18.1116 15.9286 18.867C14.8809 19.6223 13.4335 20 11.5862 20C9.94674 20 8.32335 19.6185 6.71592 18.8555V16.6009C8.23538 17.4783 9.7908 17.917 11.3822 17.917C13.9333 17.917 15.2128 17.1846 15.2208 15.7196C15.2208 15.0939 15.0049 14.5598 14.5731 14.1173C14.5339 14.0772 14.4939 14.0381 14.4531 14H3V12H21V14H17.1538ZM13.076 11H7.62908C7.4566 10.8433 7.29616 10.6692 7.14776 10.4778C6.71592 9.92084 6.5 9.24559 6.5 8.45207C6.5 7.21602 6.96583 6.165 7.89749 5.299C8.82916 4.43299 10.2706 4 12.2219 4C13.6934 4 15.1009 4.32808 16.4444 4.98426V7.13591C15.2448 6.44921 13.9293 6.10587 12.4978 6.10587C10.0187 6.10587 8.77917 6.88793 8.77917 8.45207C8.77917 8.87172 8.99709 9.23796 9.43293 9.55079C9.86878 9.86362 10.4066 10.1135 11.0463 10.3004C11.6665 10.4816 12.3431 10.7148 13.076 11H13.076Z"></path>
    </svg>
    `,
  },
  {
    group: 2,
    title: "Heading 1",
    markName: "heading",
    markOptions: { level: 1 },
    className: "menu-button-h1",
    isInFloatingMenu: false,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Heading 1</title>
        <path d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM21.0005 8V20H19.0005L19 10.204L17 10.74V8.67L19.5005 8H21.0005Z"></path>
      </svg>`,
  },
  {
    group: 2,
    title: "Heading 2",
    markName: "heading",
    markOptions: { level: 2 },
    className: "menu-button-h2",
    isInFloatingMenu: false,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Heading 2</title>
        <path d="M4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 8C20.5711 8 22.25 9.67893 22.25 11.75C22.25 12.6074 21.9623 13.3976 21.4781 14.0292L21.3302 14.2102L18.0343 18H22V20H15L14.9993 18.444L19.8207 12.8981C20.0881 12.5908 20.25 12.1893 20.25 11.75C20.25 10.7835 19.4665 10 18.5 10C17.5818 10 16.8288 10.7071 16.7558 11.6065L16.75 11.75H14.75C14.75 9.67893 16.4289 8 18.5 8Z"></path>
      </svg>`,
  },
  {
    group: 2,
    title: "Heading 3",
    markName: "heading",
    markOptions: { level: 3 },
    className: "menu-button-h3",
    isInFloatingMenu: false,
    onClick: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Heading 3</title>
        <path d="M22 8L21.9984 10L19.4934 12.883C21.0823 13.3184 22.25 14.7728 22.25 16.5C22.25 18.5711 20.5711 20.25 18.5 20.25C16.674 20.25 15.1528 18.9449 14.8184 17.2166L16.7821 16.8352C16.9384 17.6413 17.6481 18.25 18.5 18.25C19.4665 18.25 20.25 17.4665 20.25 16.5C20.25 15.5335 19.4665 14.75 18.5 14.75C18.214 14.75 17.944 14.8186 17.7056 14.9403L16.3992 13.3932L19.3484 10H15V8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"></path>
      </svg>`,
  },
  {
    group: 3,
    title: "Bullet List",
    markName: "bulletList",
    className: "menu-button-bullet-list",
    isInFloatingMenu: false,
    onClick: (editor: Editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Bullet List</title>
        <path d="M8 4H21V6H8V4ZM4.5 6.5C3.67157 6.5 3 5.82843 3 5C3 4.17157 3.67157 3.5 4.5 3.5C5.32843 3.5 6 4.17157 6 5C6 5.82843 5.32843 6.5 4.5 6.5ZM4.5 13.5C3.67157 13.5 3 12.8284 3 12C3 11.1716 3.67157 10.5 4.5 10.5C5.32843 10.5 6 11.1716 6 12C6 12.8284 5.32843 13.5 4.5 13.5ZM4.5 20.4C3.67157 20.4 3 19.7284 3 18.9C3 18.0716 3.67157 17.4 4.5 17.4C5.32843 17.4 6 18.0716 6 18.9C6 19.7284 5.32843 20.4 4.5 20.4ZM8 11H21V13H8V11ZM8 18H21V20H8V18Z"></path>
      </svg>`,
  },
  {
    group: 3,
    title: "Ordered List",
    markName: "orderedList",
    className: "menu-button-ordered-list",
    isInFloatingMenu: false,
    onClick: (editor: Editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Ordered List</title>
        <path d="M5.75024 3.5H4.71733L3.25 3.89317V5.44582L4.25002 5.17782L4.25018 8.5H3V10H7V8.5H5.75024V3.5ZM10 4H21V6H10V4ZM10 11H21V13H10V11ZM10 18H21V20H10V18ZM2.875 15.625C2.875 14.4514 3.82639 13.5 5 13.5C6.17361 13.5 7.125 14.4514 7.125 15.625C7.125 16.1106 6.96183 16.5587 6.68747 16.9167L6.68271 16.9229L5.31587 18.5H7V20H3.00012L2.99959 18.8786L5.4717 16.035C5.5673 15.9252 5.625 15.7821 5.625 15.625C5.625 15.2798 5.34518 15 5 15C4.67378 15 4.40573 15.2501 4.37747 15.5688L4.3651 15.875H2.875V15.625Z"></path>
      </svg>
    `,
  },
  {
    group: 3,
    // todo: need to remove the bullet from this
    // and make the checkbox bigger
    title: "Task List",
    markName: "taskList",
    className: "menu-button-task-list",
    isInFloatingMenu: true,
    onClick: (editor: Editor) => {
      editor.chain().focus().toggleTaskList().run();
    },
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Task List</title>
      <path d="M19 4H5V20H19V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H19.9997C20.5519 2 20.9996 2.44772 20.9997 3L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11.2929 13.1213L15.5355 8.87868L16.9497 10.2929L11.2929 15.9497L7.40381 12.0607L8.81802 10.6464L11.2929 13.1213Z"></path>
    </svg>
    `,
  },
  {
    group: 4,
    title: "Code",
    markName: "code",
    className: "menu-button-code",
    isInFloatingMenu: true,
    onClick: (editor: Editor) => {
      editor.chain().focus().toggleCode().run();
    },
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <title>Code</title>
      <path d="M23 11.9998L15.9289 19.0708L14.5147 17.6566L20.1716 11.9998L14.5147 6.34292L15.9289 4.92871L23 11.9998ZM3.82843 11.9998L9.48528 17.6566L8.07107 19.0708L1 11.9998L8.07107 4.92871L9.48528 6.34292L3.82843 11.9998Z"></path>
    </svg>
    `,
  },
  {
    group: 4,
    title: "Code Block",
    markName: "codeBlock",
    className: "menu-button-code-block",
    isInFloatingMenu: true,
    onClick: (editor: Editor) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
    html: `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Code Block</title>
    <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM4 5V19H20V5H4ZM20 12L16.4645 15.5355L15.0503 14.1213L17.1716 12L15.0503 9.87868L16.4645 8.46447L20 12ZM6.82843 12L8.94975 14.1213L7.53553 15.5355L4 12L7.53553 8.46447L8.94975 9.87868L6.82843 12ZM11.2443 17H9.11597L12.7557 7H14.884L11.2443 17Z"></path>
  </svg>
  `,
  },
  {
    group: 5,
    title: "Undo",
    isInFloatingMenu: false,
    onClick: (editor: Editor) => editor.chain().focus().undo().run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Undo</title>
        <path d="M5.82843 6.99955L8.36396 9.53509L6.94975 10.9493L2 5.99955L6.94975 1.0498L8.36396 2.46402L5.82843 4.99955H13C17.4183 4.99955 21 8.58127 21 12.9996C21 17.4178 17.4183 20.9996 13 20.9996H4V18.9996H13C16.3137 18.9996 19 16.3133 19 12.9996C19 9.68584 16.3137 6.99955 13 6.99955H5.82843Z"></path>
      </svg>
    `,
  },
  {
    group: 5,
    title: "Redo",
    isInFloatingMenu: false,
    onClick: (editor: Editor) => editor.chain().focus().redo().run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Redo</title>
        <path d="M18.1716 6.99955L15.636 9.53509L17.0502 10.9493L22 5.99955L17.0502 1.0498L15.636 2.46402L18.1716 4.99955H11C6.58172 4.99955 3 8.58127 3 12.9996C3 17.4178 6.58172 20.9996 11 20.9996H20V18.9996H11C7.68629 18.9996 5 16.3133 5 12.9996C5 9.68584 7.68629 6.99955 11 6.99955H18.1716Z"></path>
      </svg>
    `,
  },
];

/**
 * Reads editor button config and
 * generates button instances depending on menu location.
 * This is not concerned with what happens to these buttons, only their creation
 */
function instantiateEditorButtons(editor: Editor) {
  const topEditorMenuButtons: HTMLButtonElement[] = [];
  const floatingEditorMenuButtons: HTMLButtonElement[] = [];

  const renderEditorButton = (editor: Editor, button: EditorButton) => {
    return renderButton({
      title: button.title,
      html: button.html,
      className: button.className ?? "",
      onClick: () => editor && button.onClick(editor),
    });
  };

  BUTTON_CONFIGURATION.forEach((button: EditorButton) => {
    if (button.isInFloatingMenu) {
      floatingEditorMenuButtons.push(renderEditorButton(editor, button));
    }
    // add data-group attribute for grouping buttons into containers
    const renderedButton = renderEditorButton(editor, button);
    renderedButton.dataset.group = button.group.toString();
    topEditorMenuButtons.push(renderedButton);
  });

  return {
    topEditorMenuButtons,
    floatingEditorMenuButtons,
  };
}

/**
 * Render functions for the more complex editor buttons
 */
function renderSaveButton() {
  return renderButton({
    title: "Save note",
    onClick: () => dispatchEvent(new Event("save-note")),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Save note</title>  
        <path d="M7 19V13H17V19H19V7.82843L16.1716 5H5V19H7ZM4 3H17L21 7V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM9 15V19H15V15H9Z"></path>
      </svg>`,
  });
}

/**
 * Setups the delete confirmation modal and the rendered button
 * @returns button element
 */
function renderDeleteButton(id: string) {
  const modalDeleteButton = renderButton({
    title: "Delete note",
    html: "<span>Delete</span>",
    onClick: () =>
      id && createEvent("delete-note", { note: { id } }).dispatch(),
  });

  modalDeleteButton.style.marginTop = "1rem";

  // setup modal content
  const div = document.createElement("div");
  div.appendChild(
    document.createTextNode("You cannot recover a deleted note.")
  );
  div.appendChild(modalDeleteButton);

  // return the main button instance
  return renderButton({
    title: "Delete note",
    onClick: () => {
      renderModal({
        title: "Confirm deletion",
        content: div,
      });
    },
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Delete note</title>
        <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM13.4142 13.9997L15.182 15.7675L13.7678 17.1817L12 15.4139L10.2322 17.1817L8.81802 15.7675L10.5858 13.9997L8.81802 12.232L10.2322 10.8178L12 12.5855L13.7678 10.8178L15.182 12.232L13.4142 13.9997ZM9 4V6H15V4H9Z"></path>
      </svg>`,
  });
}

export {
  BUTTON_CONFIGURATION,
  instantiateEditorButtons,
  renderDeleteButton,
  renderSaveButton,
};
