import { EditorStore } from 'store'
import { renderButton } from 'components'
import { renderNoteDetailsModal } from './note-details-modal'
import type { Button } from 'components'
import type { MarkOptions } from 'types'

interface EditorButton extends Button {
  group: number // used for placing in which div for organization
  isInFloatingMenu: boolean
  markName?: string // used for toggling css
  markOptions?: MarkOptions // used for toggling css
}

/**
 * Configuration object for creating buttons.
 * Also used by the editor to toggle active CSS
 */
const BUTTON_CONFIGURATION: EditorButton[] = [
  {
    group: 1,
    title: 'Bold',
    markName: 'bold',
    className: 'menu-button-bold',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().toggleBold().run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Bold</title>
        <path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z"></path>
      </svg>`,
  },
  {
    group: 1,
    title: 'Italic',
    markName: 'italic',
    className: 'menu-button-italic',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().toggleItalic().run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Italic</title>
        <path d="M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z"></path>
      </svg>`,
  },
  {
    group: 1,
    title: 'Underline',
    markName: 'underline',
    className: 'menu-button-underline',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().toggleUnderline().run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Underline</title>
        <path d="M8 3V12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12V3H18V12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12V3H8ZM4 20H20V22H4V20Z"></path>
      </svg>`,
  },
  {
    group: 1,
    title: 'Strike',
    markName: 'strike',
    className: 'menu-button-strike',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().toggleStrike().run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Strike-through</title>
        <path d="M17.1538 14C17.3846 14.5161 17.5 15.0893 17.5 15.7196C17.5 17.0625 16.9762 18.1116 15.9286 18.867C14.8809 19.6223 13.4335 20 11.5862 20C9.94674 20 8.32335 19.6185 6.71592 18.8555V16.6009C8.23538 17.4783 9.7908 17.917 11.3822 17.917C13.9333 17.917 15.2128 17.1846 15.2208 15.7196C15.2208 15.0939 15.0049 14.5598 14.5731 14.1173C14.5339 14.0772 14.4939 14.0381 14.4531 14H3V12H21V14H17.1538ZM13.076 11H7.62908C7.4566 10.8433 7.29616 10.6692 7.14776 10.4778C6.71592 9.92084 6.5 9.24559 6.5 8.45207C6.5 7.21602 6.96583 6.165 7.89749 5.299C8.82916 4.43299 10.2706 4 12.2219 4C13.6934 4 15.1009 4.32808 16.4444 4.98426V7.13591C15.2448 6.44921 13.9293 6.10587 12.4978 6.10587C10.0187 6.10587 8.77917 6.88793 8.77917 8.45207C8.77917 8.87172 8.99709 9.23796 9.43293 9.55079C9.86878 9.86362 10.4066 10.1135 11.0463 10.3004C11.6665 10.4816 12.3431 10.7148 13.076 11H13.076Z"></path>
      </svg>`,
  },
  {
    group: 2,
    title: 'Heading 1',
    markName: 'heading',
    markOptions: { level: 1 },
    className: 'menu-button-h1',
    isInFloatingMenu: false,
    onClick: () =>
      EditorStore.editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Heading 1</title>
        <path d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM21.0005 8V20H19.0005L19 10.204L17 10.74V8.67L19.5005 8H21.0005Z"></path>
      </svg>`,
  },
  {
    group: 2,
    title: 'Heading 2',
    markName: 'heading',
    markOptions: { level: 2 },
    className: 'menu-button-h2',
    isInFloatingMenu: false,
    onClick: () =>
      EditorStore.editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Heading 2</title>
        <path d="M4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 8C20.5711 8 22.25 9.67893 22.25 11.75C22.25 12.6074 21.9623 13.3976 21.4781 14.0292L21.3302 14.2102L18.0343 18H22V20H15L14.9993 18.444L19.8207 12.8981C20.0881 12.5908 20.25 12.1893 20.25 11.75C20.25 10.7835 19.4665 10 18.5 10C17.5818 10 16.8288 10.7071 16.7558 11.6065L16.75 11.75H14.75C14.75 9.67893 16.4289 8 18.5 8Z"></path>
      </svg>`,
  },
  {
    group: 2,
    title: 'Heading 3',
    markName: 'heading',
    markOptions: { level: 3 },
    className: 'menu-button-h3',
    isInFloatingMenu: false,
    onClick: () =>
      EditorStore.editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Heading 3</title>
        <path d="M22 8L21.9984 10L19.4934 12.883C21.0823 13.3184 22.25 14.7728 22.25 16.5C22.25 18.5711 20.5711 20.25 18.5 20.25C16.674 20.25 15.1528 18.9449 14.8184 17.2166L16.7821 16.8352C16.9384 17.6413 17.6481 18.25 18.5 18.25C19.4665 18.25 20.25 17.4665 20.25 16.5C20.25 15.5335 19.4665 14.75 18.5 14.75C18.214 14.75 17.944 14.8186 17.7056 14.9403L16.3992 13.3932L19.3484 10H15V8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"></path>
      </svg>`,
  },
  {
    group: 3,
    title: 'Bullet List',
    markName: 'bulletList',
    className: 'menu-button-bullet-list',
    isInFloatingMenu: false,
    onClick: () => {
      EditorStore.editor?.chain().focus().toggleBulletList().run()
    },
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Bullet List</title>
        <path d="M8 4H21V6H8V4ZM4.5 6.5C3.67157 6.5 3 5.82843 3 5C3 4.17157 3.67157 3.5 4.5 3.5C5.32843 3.5 6 4.17157 6 5C6 5.82843 5.32843 6.5 4.5 6.5ZM4.5 13.5C3.67157 13.5 3 12.8284 3 12C3 11.1716 3.67157 10.5 4.5 10.5C5.32843 10.5 6 11.1716 6 12C6 12.8284 5.32843 13.5 4.5 13.5ZM4.5 20.4C3.67157 20.4 3 19.7284 3 18.9C3 18.0716 3.67157 17.4 4.5 17.4C5.32843 17.4 6 18.0716 6 18.9C6 19.7284 5.32843 20.4 4.5 20.4ZM8 11H21V13H8V11ZM8 18H21V20H8V18Z"></path>
      </svg>`,
  },
  {
    group: 3,
    title: 'Ordered List',
    markName: 'orderedList',
    className: 'menu-button-ordered-list',
    isInFloatingMenu: false,
    onClick: () => {
      EditorStore.editor?.chain().focus().toggleOrderedList().run()
    },
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Ordered List</title>
        <path d="M5.75024 3.5H4.71733L3.25 3.89317V5.44582L4.25002 5.17782L4.25018 8.5H3V10H7V8.5H5.75024V3.5ZM10 4H21V6H10V4ZM10 11H21V13H10V11ZM10 18H21V20H10V18ZM2.875 15.625C2.875 14.4514 3.82639 13.5 5 13.5C6.17361 13.5 7.125 14.4514 7.125 15.625C7.125 16.1106 6.96183 16.5587 6.68747 16.9167L6.68271 16.9229L5.31587 18.5H7V20H3.00012L2.99959 18.8786L5.4717 16.035C5.5673 15.9252 5.625 15.7821 5.625 15.625C5.625 15.2798 5.34518 15 5 15C4.67378 15 4.40573 15.2501 4.37747 15.5688L4.3651 15.875H2.875V15.625Z"></path>
      </svg>`,
  },
  {
    group: 3,
    // todo: need to remove the bullet from this
    // and make the checkbox bigger
    title: 'Task List',
    markName: 'taskList',
    className: 'menu-button-task-list',
    isInFloatingMenu: true,
    onClick: () => {
      EditorStore.editor?.chain().focus().toggleTaskList().run()
    },
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Task List</title>
        <path d="M19 4H5V20H19V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H19.9997C20.5519 2 20.9996 2.44772 20.9997 3L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11.2929 13.1213L15.5355 8.87868L16.9497 10.2929L11.2929 15.9497L7.40381 12.0607L8.81802 10.6464L11.2929 13.1213Z"></path>
      </svg>`,
  },
  {
    group: 4,
    title: 'Code Block',
    markName: 'codeBlock',
    className: 'menu-button-code-block',
    isInFloatingMenu: true,
    onClick: () => {
      EditorStore.editor?.chain().focus().toggleCodeBlock().run()
    },
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Code Block</title>
        <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM4 5V19H20V5H4ZM20 12L16.4645 15.5355L15.0503 14.1213L17.1716 12L15.0503 9.87868L16.4645 8.46447L20 12ZM6.82843 12L8.94975 14.1213L7.53553 15.5355L4 12L7.53553 8.46447L8.94975 9.87868L6.82843 12ZM11.2443 17H9.11597L12.7557 7H14.884L11.2443 17Z"></path>
      </svg>`,
  },
  {
    group: 5,
    title: 'Undo',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().undo().run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Undo</title>
        <path d="M5.82843 6.99955L8.36396 9.53509L6.94975 10.9493L2 5.99955L6.94975 1.0498L8.36396 2.46402L5.82843 4.99955H13C17.4183 4.99955 21 8.58127 21 12.9996C21 17.4178 17.4183 20.9996 13 20.9996H4V18.9996H13C16.3137 18.9996 19 16.3133 19 12.9996C19 9.68584 16.3137 6.99955 13 6.99955H5.82843Z"></path>
      </svg>`,
  },
  {
    group: 5,
    title: 'Redo',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().redo().run(),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Redo</title>
        <path d="M18.1716 6.99955L15.636 9.53509L17.0502 10.9493L22 5.99955L17.0502 1.0498L15.636 2.46402L18.1716 4.99955H11C6.58172 4.99955 3 8.58127 3 12.9996C3 17.4178 6.58172 20.9996 11 20.9996H20V18.9996H11C7.68629 18.9996 5 16.3133 5 12.9996C5 9.68584 7.68629 6.99955 11 6.99955H18.1716Z"></path>
      </svg>`,
  },
  {
    group: 6,
    title: 'Save note',
    isInFloatingMenu: false,
    onClick: () => dispatchEvent(new Event('save-note')),
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Save note</title>  
        <path d="M7 19V13H17V19H19V7.82843L16.1716 5H5V19H7ZM4 3H17L21 7V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM9 15V19H15V15H9Z"></path>
      </svg>`,
  },
  {
    group: 6,
    title: 'Note settings',
    isInFloatingMenu: false,
    onClick: renderNoteDetailsModal,
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>Note settings</title>
        <path d="M3.33946 17.0002C2.90721 16.2515 2.58277 15.4702 2.36133 14.6741C3.3338 14.1779 3.99972 13.1668 3.99972 12.0002C3.99972 10.8345 3.3348 9.824 2.36353 9.32741C2.81025 7.71651 3.65857 6.21627 4.86474 4.99001C5.7807 5.58416 6.98935 5.65534 7.99972 5.072C9.01009 4.48866 9.55277 3.40635 9.4962 2.31604C11.1613 1.8846 12.8847 1.90004 14.5031 2.31862C14.4475 3.40806 14.9901 4.48912 15.9997 5.072C17.0101 5.65532 18.2187 5.58416 19.1346 4.99007C19.7133 5.57986 20.2277 6.25151 20.66 7.00021C21.0922 7.7489 21.4167 8.53025 21.6381 9.32628C20.6656 9.82247 19.9997 10.8336 19.9997 12.0002C19.9997 13.166 20.6646 14.1764 21.6359 14.673C21.1892 16.2839 20.3409 17.7841 19.1347 19.0104C18.2187 18.4163 17.0101 18.3451 15.9997 18.9284C14.9893 19.5117 14.4467 20.5941 14.5032 21.6844C12.8382 22.1158 11.1148 22.1004 9.49633 21.6818C9.55191 20.5923 9.00929 19.5113 7.99972 18.9284C6.98938 18.3451 5.78079 18.4162 4.86484 19.0103C4.28617 18.4205 3.77172 17.7489 3.33946 17.0002ZM8.99972 17.1964C10.0911 17.8265 10.8749 18.8227 11.2503 19.9659C11.7486 20.0133 12.2502 20.014 12.7486 19.9675C13.1238 18.8237 13.9078 17.8268 14.9997 17.1964C16.0916 16.5659 17.347 16.3855 18.5252 16.6324C18.8146 16.224 19.0648 15.7892 19.2729 15.334C18.4706 14.4373 17.9997 13.2604 17.9997 12.0002C17.9997 10.74 18.4706 9.5632 19.2729 8.6665C19.1688 8.4405 19.0538 8.21822 18.9279 8.00021C18.802 7.78219 18.667 7.57148 18.5233 7.36842C17.3457 7.61476 16.0911 7.43414 14.9997 6.80405C13.9083 6.17395 13.1246 5.17768 12.7491 4.03455C12.2509 3.98714 11.7492 3.98646 11.2509 4.03292C10.8756 5.17671 10.0916 6.17364 8.99972 6.80405C7.9078 7.43447 6.65245 7.61494 5.47428 7.36803C5.18485 7.77641 4.93463 8.21117 4.72656 8.66637C5.52881 9.56311 5.99972 10.74 5.99972 12.0002C5.99972 13.2604 5.52883 14.4372 4.72656 15.3339C4.83067 15.5599 4.94564 15.7822 5.07152 16.0002C5.19739 16.2182 5.3324 16.4289 5.47612 16.632C6.65377 16.3857 7.90838 16.5663 8.99972 17.1964ZM11.9997 15.0002C10.3429 15.0002 8.99972 13.6571 8.99972 12.0002C8.99972 10.3434 10.3429 9.00021 11.9997 9.00021C13.6566 9.00021 14.9997 10.3434 14.9997 12.0002C14.9997 13.6571 13.6566 15.0002 11.9997 15.0002ZM11.9997 13.0002C12.552 13.0002 12.9997 12.5525 12.9997 12.0002C12.9997 11.4479 12.552 11.0002 11.9997 11.0002C11.4474 11.0002 10.9997 11.4479 10.9997 12.0002C10.9997 12.5525 11.4474 13.0002 11.9997 13.0002Z" fill="currentColor"></path>
      </svg>`,
  },
]

/**
 * Reads editor button config and
 * generates button instances depending on menu location.
 * This is not concerned with what happens to these buttons, only their creation
 */
function instantiateEditorButtons() {
  const topEditorMenuButtons: HTMLButtonElement[] = []
  const floatingEditorMenuButtons: HTMLButtonElement[] = []

  BUTTON_CONFIGURATION.forEach((button: EditorButton) => {
    if (button.isInFloatingMenu)
      floatingEditorMenuButtons.push(
        renderButton({
          title: button.title,
          html: button.html,
          className: button.className ?? '',
          onClick: button.onClick,
        })
      )

    // add data-group attribute for grouping buttons into containers
    const renderedButton = renderButton({
      title: button.title,
      html: button.html,
      className: button.className ?? '',
      onClick: button.onClick,
    })
    renderedButton.dataset.group = button.group.toString()
    topEditorMenuButtons.push(renderedButton)
  })

  return {
    topEditorMenuButtons,
    floatingEditorMenuButtons,
  }
}

export { BUTTON_CONFIGURATION, instantiateEditorButtons }
