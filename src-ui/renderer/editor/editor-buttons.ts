import { NoteEvents, createEvent } from 'event'
import { EditorStore } from 'store'
import { Button } from 'components'
import { noteDetailsDialog } from 'renderer/reactive'
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
import type { MarkOptions, Note } from 'types'

interface EditorButton extends ButtonOptions {
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
    html: boldIcon,
  },
  {
    group: 1,
    title: 'Italic',
    markName: 'italic',
    className: 'menu-button-italic',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().toggleItalic().run(),
    html: italicIcon,
  },
  {
    group: 1,
    title: 'Underline',
    markName: 'underline',
    className: 'menu-button-underline',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().toggleUnderline().run(),
    html: underlineIcon,
  },
  {
    group: 1,
    title: 'Strike',
    markName: 'strike',
    className: 'menu-button-strike',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().toggleStrike().run(),
    html: strikeIcon,
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
    html: heading1Icon,
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
    html: heading2Icon,
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
    html: heading3Icon,
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
    html: bulletListIcon,
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
    html: orderedListIcon,
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
    html: taskListIcon,
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
    html: codeBlockIcon,
  },
  {
    group: 5,
    title: 'Undo',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().undo().run(),
    html: undoIcon,
  },
  {
    group: 5,
    title: 'Redo',
    isInFloatingMenu: false,
    onClick: () => EditorStore.editor?.chain().focus().redo().run(),
    html: redoIcon,
  },
  {
    group: 6,
    title: 'Save note',
    isInFloatingMenu: false,
    onClick: (arg) => {
      if (typeof arg === 'object' && arg !== null) {
        const note = arg as Note
        const noteToSave = { ...note }
        noteToSave.content = EditorStore.editor?.getHTML() ?? note?.content
        createEvent(NoteEvents.Save, { note: noteToSave }).dispatch()
      }
    },
    html: saveIcon,
  },
  {
    group: 6,
    title: 'Note settings',
    isInFloatingMenu: false,
    onClick: (note) => noteDetailsDialog.render(note as Note),
    html: settingsIcon,
  },
]

function instantiateTopMenuButtons(note: Note | null) {
  return BUTTON_CONFIGURATION.filter((b) => !b.isInFloatingMenu).map((b) => {
    const button = new Button({
      title: b.title,
      html: b.html,
      className: b.className ?? '',
      onClick: () => b.onClick(note),
    }).getElement()

    button.dataset.group = b.group.toString()
    return button
  })
}

function instantiateFloatingMenuButtons(note: Note | null) {
  return BUTTON_CONFIGURATION.filter((b) => b.isInFloatingMenu).map((b) =>
    new Button({
      title: b.title,
      html: b.html,
      className: b.className ?? '',
      onClick: () => b.onClick(note),
    }).getElement()
  )
}

export {
  BUTTON_CONFIGURATION,
  instantiateTopMenuButtons,
  instantiateFloatingMenuButtons,
}
