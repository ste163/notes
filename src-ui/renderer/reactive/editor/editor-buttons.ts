import { Button } from 'components'
import {
  boldIcon,
  bulletListIcon,
  codeBlockIcon,
  heading1Icon,
  heading2Icon,
  heading3Icon,
  italicIcon,
  linkIcon,
  orderedListIcon,
  strikeIcon,
  taskListIcon,
  underlineIcon,
} from 'icons'
import type { ButtonOptions } from 'components'
import type { MarkOptions } from 'types'
import type { Editor } from '@tiptap/core'

interface EditorButton extends Omit<ButtonOptions, 'onClick'> {
  group: number // used for placing in which div for organization
  onClick: (editor: Editor | null) => void
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
    onClick: (editor) => editor?.chain().focus().toggleBold().run(),
    html: boldIcon,
  },
  {
    group: 1,
    title: 'Italic',
    markName: 'italic',
    className: 'menu-button-italic',
    onClick: (editor) => editor?.chain().focus().toggleItalic().run(),
    html: italicIcon,
  },
  {
    group: 1,
    title: 'Underline',
    markName: 'underline',
    className: 'menu-button-underline',
    onClick: (editor) => editor?.chain().focus().toggleUnderline().run(),
    html: underlineIcon,
  },
  {
    group: 1,
    title: 'Strike',
    markName: 'strike',
    className: 'menu-button-strike',
    onClick: (editor) => editor?.chain().focus().toggleStrike().run(),
    html: strikeIcon,
  },
  {
    group: 2,
    title: 'Heading 1',
    markName: 'heading',
    markOptions: { level: 1 },
    className: 'menu-button-h1',
    onClick: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    html: heading1Icon,
  },
  {
    group: 2,
    title: 'Heading 2',
    markName: 'heading',
    markOptions: { level: 2 },
    className: 'menu-button-h2',
    onClick: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    html: heading2Icon,
  },
  {
    group: 2,
    title: 'Heading 3',
    markName: 'heading',
    markOptions: { level: 3 },
    className: 'menu-button-h3',
    onClick: (editor) =>
      editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    html: heading3Icon,
  },
  {
    group: 3,
    title: 'Bullet List',
    markName: 'bulletList',
    className: 'menu-button-bullet-list',
    onClick: (editor) => {
      editor?.chain().focus().toggleBulletList().run()
    },
    html: bulletListIcon,
  },
  {
    group: 3,
    title: 'Ordered List',
    markName: 'orderedList',
    className: 'menu-button-ordered-list',
    onClick: (editor) => {
      editor?.chain().focus().toggleOrderedList().run()
    },
    html: orderedListIcon,
  },
  {
    group: 3,
    title: 'Task List',
    markName: 'taskList',
    className: 'menu-button-task-list',
    onClick: (editor) => {
      editor?.chain().focus().toggleTaskList().run()
    },
    html: taskListIcon,
  },
  {
    group: 4,
    title: 'Code Block',
    markName: 'codeBlock',
    className: 'menu-button-code-block',
    onClick: (editor) => {
      editor?.chain().focus().toggleCodeBlock().run()
    },
    html: codeBlockIcon,
  },
  {
    group: 4,
    title: 'Link',
    markName: 'link',
    className: 'menu-button-link',
    onClick: (editor) => {
      const isLink = editor?.isActive('link')
      const setLink = () => {
        const url = window.prompt('URL')
        if (url) {
          const validateProtocol = (url: string) =>
            url.startsWith('http://') && url.startsWith('https://')
              ? url
              : 'https://' + url
          editor
            ?.chain()
            .focus()
            .toggleLink({ href: validateProtocol(url) })
            .run()
        }
      }
      isLink ? editor?.chain().focus().unsetLink().run() : setLink()
    },
    html: linkIcon,
  },
]

function instantiateMenuButtons(editor: Editor | null) {
  return BUTTON_CONFIGURATION.map((b) => {
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

export { BUTTON_CONFIGURATION, instantiateMenuButtons }
