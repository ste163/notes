import { DialogEvents, NoteEvents, createEvent } from 'event'
import { Button } from 'components'
import {
  boldIcon,
  bulletListIcon,
  codeBlockIcon,
  heading1Icon,
  heading2Icon,
  heading3Icon,
  italicIcon,
  orderedListIcon,
  redoIcon,
  saveIcon,
  settingsIcon,
  strikeIcon,
  taskListIcon,
  underlineIcon,
  undoIcon,
} from 'icons'
import type { ButtonOptions } from 'components'
import type { MarkOptions } from 'types'
import type { Editor } from '@tiptap/core'

interface EditorButton extends Omit<ButtonOptions, 'onClick'> {
  group: number // used for placing in which div for organization
  onClick: (editor: Editor | null) => void
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
    title: 'Save note',
    isInFloatingMenu: false,
    onClick: () => {
      // TODO: save will just call the save event, and then from index
      // the save event will call editor.getContent which will get everything
      // ready to be saved
      createEvent(NoteEvents.Save).dispatch()
    },
    html: saveIcon,
  },
  {
    group: 1,
    title: 'Note settings',
    isInFloatingMenu: false,
    onClick: () => createEvent(DialogEvents.OpenNoteDetails).dispatch(),
    html: settingsIcon,
  },
  {
    group: 2,
    title: 'Bold',
    markName: 'bold',
    className: 'menu-button-bold',
    isInFloatingMenu: false,
    onClick: (editor) => editor?.chain().focus().toggleBold().run(),
    html: boldIcon,
  },
  {
    group: 2,
    title: 'Italic',
    markName: 'italic',
    className: 'menu-button-italic',
    isInFloatingMenu: false,
    onClick: (editor) => editor?.chain().focus().toggleItalic().run(),
    html: italicIcon,
  },
  {
    group: 2,
    title: 'Underline',
    markName: 'underline',
    className: 'menu-button-underline',
    isInFloatingMenu: false,
    onClick: (editor) => editor?.chain().focus().toggleUnderline().run(),
    html: underlineIcon,
  },
  {
    group: 2,
    title: 'Strike',
    markName: 'strike',
    className: 'menu-button-strike',
    isInFloatingMenu: false,
    onClick: (editor) => editor?.chain().focus().toggleStrike().run(),
    html: strikeIcon,
  },
  {
    group: 3,
    title: 'Heading 1',
    markName: 'heading',
    markOptions: { level: 1 },
    className: 'menu-button-h1',
    isInFloatingMenu: false,
    onClick: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    html: heading1Icon,
  },
  {
    group: 3,
    title: 'Heading 2',
    markName: 'heading',
    markOptions: { level: 2 },
    className: 'menu-button-h2',
    isInFloatingMenu: false,
    onClick: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    html: heading2Icon,
  },
  {
    group: 3,
    title: 'Heading 3',
    markName: 'heading',
    markOptions: { level: 3 },
    className: 'menu-button-h3',
    isInFloatingMenu: false,
    onClick: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    html: heading3Icon,
  },
  {
    group: 4,
    title: 'Bullet List',
    markName: 'bulletList',
    className: 'menu-button-bullet-list',
    isInFloatingMenu: false,
    onClick: (editor) => {
      editor?.chain().focus().toggleBulletList().run()
    },
    html: bulletListIcon,
  },
  {
    group: 4,
    title: 'Ordered List',
    markName: 'orderedList',
    className: 'menu-button-ordered-list',
    isInFloatingMenu: false,
    onClick: (editor) => {
      editor?.chain().focus().toggleOrderedList().run()
    },
    html: orderedListIcon,
  },
  {
    group: 4,
    // todo: need to remove the bullet from this
    // and make the checkbox bigger
    title: 'Task List',
    markName: 'taskList',
    className: 'menu-button-task-list',
    isInFloatingMenu: true,
    onClick: (editor) => {
      editor?.chain().focus().toggleTaskList().run()
    },
    html: taskListIcon,
  },
  {
    group: 5,
    title: 'Code Block',
    markName: 'codeBlock',
    className: 'menu-button-code-block',
    isInFloatingMenu: true,
    onClick: (editor) => {
      editor?.chain().focus().toggleCodeBlock().run()
    },
    html: codeBlockIcon,
  },
  {
    group: 6,
    title: 'Undo',
    isInFloatingMenu: false,
    onClick: (editor) => editor?.chain().focus().undo().run(),
    html: undoIcon,
  },
  {
    group: 6,
    title: 'Redo',
    isInFloatingMenu: false,
    onClick: (editor) => editor?.chain().focus().redo().run(),
    html: redoIcon,
  },
]

function instantiateMenuButtons(editor: Editor | null) {
  return BUTTON_CONFIGURATION.filter((b) => !b.isInFloatingMenu).map((b) => {
    const button = new Button({
      title: b.title,
      html: b.html,
      className: b.className ?? '',
      onClick: () => b.onClick(editor),
    }).getElement()
    button.dataset.group = b.group.toString()
    return button
  })
}

function instantiateFloatingMenuButtons(editor: Editor | null) {
  return BUTTON_CONFIGURATION.filter((b) => b.isInFloatingMenu).map((b) =>
    new Button({
      title: b.title,
      html: b.html,
      className: b.className ?? '',
      onClick: () => b.onClick(editor),
    }).getElement()
  )
}

export {
  BUTTON_CONFIGURATION,
  instantiateMenuButtons,
  instantiateFloatingMenuButtons,
}
