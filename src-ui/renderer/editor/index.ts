import { EditorStore } from 'store'
import {
  BUTTON_CONFIGURATION,
  instantiateEditorButtons,
} from './editor-buttons'
import { Editor } from '@tiptap/core'
import FloatingMenu from '@tiptap/extension-floating-menu'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Heading from '@tiptap/extension-heading'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import History from '@tiptap/extension-history'
import type { MarkOptions } from 'types'
import './editor.css'

/**
 * Instantiates the editor and returns the instance.
 */
async function renderEditor({
  editorElement,
  topEditorMenu,
  floatingEditorMenu,
  editorContent,
}: {
  editorElement: Element
  topEditorMenu: Element
  floatingEditorMenu: Element
  editorContent?: string
}): Promise<Editor> {
  const editor = new Editor({
    element: editorElement,
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      Heading,
      BulletList,
      ListItem,
      OrderedList,
      TaskList,
      TaskItem.configure({ nested: true }),
      Code.configure({
        HTMLAttributes: {
          class: 'code',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
      History,
      FloatingMenu.configure({
        element: floatingEditorMenu as HTMLElement,
        shouldShow: ({ editor, view }) =>
          view.state.selection.$head.node().content.size === 0
            ? editor.isActive('paragraph')
            : false,
      }),
    ],
    content: editorContent ?? '<p>Issue selecting note</p>',
    onUpdate: ({ editor }) => {
      if (EditorStore.isDirty) return
      const currentContent = editor.getHTML()
      EditorStore.isDirty = currentContent !== editorContent
    },
    onTransaction: ({ editor }) => {
      /**
       * onTransaction tracks cursor position
       * and is used to toggle active css for each button
       */
      BUTTON_CONFIGURATION.forEach(({ className, markName, markOptions }) => {
        if (!className) return
        toggleActiveEditorClass({
          className,
          markName: markName ?? '',
          markOptions,
          editor,
        })
      })
    },
  })

  renderTopMenu(topEditorMenu)
  renderFloatingMenu(floatingEditorMenu)

  // TODO: only set these IF we're selecting a new note
  // if the same note is active, then we don't want to reset
  // pointer positioning (like on a save event, otherwise it's awkward)

  // reset editor scroll position
  editorElement.scrollTop = 0
  // focus on editor
  editor.commands.focus('start')

  return editor
}

/**
 * Instantiates top-menu buttons and organizes them into their container groups
 */
function renderTopMenu(topEditorMenu: Element) {
  const { topEditorMenuButtons } = instantiateEditorButtons()
  // setup editor buttons (bold, italic, etc.)
  topEditorMenuButtons.forEach((button) => {
    // get the button grouping from the data attribute
    const group = button.dataset.group
    if (!group) throw new Error('Top menu button is not assigned to a group')
    const groupId = `top-menu-group-${group}`
    let groupContainer = document.querySelector(`#${groupId}`)
    if (!groupContainer) {
      groupContainer = document.createElement('div')
      groupContainer.id = groupId
    }
    topEditorMenu.appendChild(groupContainer)
    groupContainer.appendChild(button)
  })
}

function renderFloatingMenu(floatingEditorMenuContainer: Element) {
  const { floatingEditorMenuButtons } = instantiateEditorButtons()
  floatingEditorMenuButtons.forEach((button) => {
    floatingEditorMenuContainer.appendChild(button)
  })
}

/**
 * Toggle active css state for Editor based on the given
 * elementSelector, editor instance, and mark name.
 * Always call editor.isActive as tiptap is
 * the state-manager and will always be in sync.
 *
 * ie: toggleIsActiveCss({elementSelector: 'bold-button', markName: 'bold', editor: Editor})
 */
function toggleActiveEditorClass({
  className,
  markName,
  markOptions,
  editor,
}: {
  className: string
  markName: string
  markOptions?: MarkOptions
  editor: Editor
}): void {
  const elements = document.querySelectorAll(`.${className}`)
  if (!elements.length) return
  elements.forEach((element) => {
    // isActive checks the current cursor position
    editor.isActive(markName, markOptions && markOptions)
      ? element.classList.add('isActive')
      : element.classList.remove('isActive')
  })
}

export { renderEditor }
export { instantiateEditorButtons } from './editor-buttons'
