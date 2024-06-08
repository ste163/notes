import { BUTTON_CONFIGURATION, instantiateMenuButtons } from './editor-buttons'
import { Editor as TipTapEditor } from '@tiptap/core'
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
import type { FocusPosition } from '@tiptap/core'
import './editor.css'

const STARTING_CONTENT = `<h1>Get started</h1><p>Create a note from the sidebar.</p>`

class Editor {
  private editor: TipTapEditor | null = null
  private note: Note | null = null
  private isDirty = false

  constructor() {
    this.render()
  }

  public render() {
    const container = document.querySelector('#main')
    if (!container) throw new Error('Main container not found')
    container.innerHTML = ''
    container.innerHTML = `
    <div id='editor-menu'></div>
    <div id='editor-floating-menu'></div>
    <div id='editor'></div>
    `
    this.isDirty = false
    this.editor = this.instantiateTipTap(this.note)
    this.renderMenu()
  }

  public renderMenu(isDisabled = false) {
    const container = document.querySelector('#editor-menu')
    if (!container) return
    container.innerHTML = '' // reset container before rendering

    const buttons = instantiateMenuButtons(this.editor)
    buttons.forEach((button) => {
      if (isDisabled) button.disabled = true

      // group buttons by data attribute
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

  public getIsDirty() {
    return this.isDirty
  }

  public getContent() {
    return this.editor?.getHTML() ?? ''
  }

  public setNote(note: Note | null) {
    this.note = note
    this.render()
  }

  public setDisabled(isDisabled: boolean) {
    this.editor?.setEditable(!isDisabled)
    this.renderMenu(isDisabled)
  }

  public setCursorPosition(position: FocusPosition) {
    this.editor?.commands.focus(position)
  }

  private toggleActiveEditorClass({
    className,
    markName,
    markOptions,
  }: {
    className: string
    markName: string
    markOptions?: MarkOptions
  }): void {
    const elements = document.querySelectorAll(`.${className}`)
    if (!elements.length) return
    elements.forEach((element) => {
      // isActive checks the current cursor position
      this.editor?.isActive(markName, markOptions && markOptions)
        ? element.classList.add('isActive')
        : element.classList.remove('isActive')
    })
  }

  private instantiateTipTap(note: Note | null) {
    const editor = new TipTapEditor({
      element: document.querySelector('#editor') as Element,
      extensions: [
        Document,
        History,
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
      ],
      content: note?.content ?? STARTING_CONTENT,
      onUpdate: ({ editor }) => {
        if (this.isDirty) return
        const currentContent = editor.getHTML()
        if (currentContent === STARTING_CONTENT) return
        this.isDirty = currentContent !== note?.content
      },
      onTransaction: () => {
        /**
         * onTransaction tracks cursor position
         * and is used to toggle active css for each button
         */
        BUTTON_CONFIGURATION.forEach(({ className, markName, markOptions }) => {
          if (!className) return
          this.toggleActiveEditorClass({
            className,
            markName: markName ?? '',
            markOptions,
          })
        })
      },
    })

    return editor
  }
}

const editor = new Editor()

export { editor }
