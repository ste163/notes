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
import CodeBlock from '@tiptap/extension-code-block'
import History from '@tiptap/extension-history'
import type { MarkOptions, Note } from 'types'
import './editor.css'

/**
 * Instantiates the editor and returns the instance.
 */
async function renderEditor({
  note,
  isLoading,
}: {
  note: Note | null
  isLoading: boolean
}): Promise<Editor | void> {
  const editorElement = document.querySelector('#editor')
  const topEditorMenu = document.querySelector('#editor-top-menu')
  const floatingEditorMenu = document.querySelector('#editor-floating-menu')
  if (!editorElement) throw new Error('Unable to find editor element')

  if (editorElement) editorElement.innerHTML = '' // reset container before rendering

  if (isLoading) {
    editorElement.innerHTML = 'Loading...'
    return
  }

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
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
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
    content:
      note?.content ??
      `<h1>Get started</h1><p>Create a note from the sidebar.</p>`,
    onUpdate: ({ editor }) => {
      if (EditorStore.isDirty) return
      const currentContent = editor.getHTML()
      EditorStore.isDirty = currentContent !== note?.content
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
  if (topEditorMenu) renderTopMenu(topEditorMenu, note)
  if (floatingEditorMenu) renderFloatingMenu(floatingEditorMenu, note)

  /**
   * If no note was passed in, then we're rendering the Get started content
   */
  if (!note) editor.setEditable(false)

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
function renderTopMenu(container: Element, note: Note | null) {
  container.innerHTML = '' // reset container before rendering
  const { topEditorMenuButtons } = instantiateEditorButtons(note)
  // setup editor buttons (bold, italic, etc.)
  topEditorMenuButtons.forEach((button) => {
    if (!note) button.disabled = true // rendering Get Started, disable editing
    // get the button grouping from the data attribute
    const group = button.dataset.group
    if (!group) throw new Error('Top menu button is not assigned to a group')
    const groupId = `top-menu-group-${group}`
    let groupContainer = document.querySelector(`#${groupId}`)
    if (!groupContainer) {
      groupContainer = document.createElement('div')
      groupContainer.id = groupId
    }
    container.appendChild(groupContainer)
    groupContainer.appendChild(button)
  })
}

function renderFloatingMenu(container: Element, note: Note | null) {
  container.innerHTML = '' // reset container before rendering
  const { floatingEditorMenuButtons } = instantiateEditorButtons(note)
  floatingEditorMenuButtons.forEach((button) => {
    container.appendChild(button)
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
