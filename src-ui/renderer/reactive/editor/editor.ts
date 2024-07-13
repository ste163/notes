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
import { Button, Input } from 'components'
import { NoteEvents, createEvent } from 'event'
import type { MarkOptions, Note } from 'types'
import type { FocusPosition } from '@tiptap/core'
import './editor.css'

const STARTING_CONTENT = `<h1>Get started</h1><p>Create or select a note from the sidebar.</p>`

class Editor {
  private editor: TipTapEditor | null = null
  private note: Note | null = null
  private isDirty = false

  private resizeObserver: ResizeObserver | null = null
  private editorTitleContainer: HTMLDivElement | null = null
  private editorMenuContainer: HTMLDivElement | null = null
  private editorContainer: HTMLDivElement | null = null

  public render() {
    const container = document.querySelector('#main')
    if (!container) throw new Error('Main container not found')

    container.innerHTML = ''

    const resetResizeObserver = (container: Element) => {
      if (this.resizeObserver) this.resizeObserver.disconnect()
      const handleResize = (entries: ResizeObserverEntry[]) => {
        const main = entries[0] // only watching one element
        const width = main.contentRect.width

        const editorMenu = document.querySelector('#editor-menu')
        const editorMenuGroups = editorMenu?.querySelectorAll('[data-group]')

        const ellipsisMenu = document.querySelector(
          '.editor-ellipsis-menu-hidden'
        )
        const ellipsisMenuGroups =
          ellipsisMenu?.querySelectorAll('[data-group]')

        const getGroupIndex = (
          elements: NodeListOf<Element> | undefined,
          order: 'asc' | 'dsc'
        ) => {
          return parseInt(
            Array.from(elements || [])
              .sort((a, b) =>
                order === 'asc'
                  ? parseInt(a?.getAttribute('data-group') || '0') -
                    parseInt(b?.getAttribute('data-group') || '0')
                  : parseInt(b?.getAttribute('data-group') || '0') -
                    parseInt(a?.getAttribute('data-group') || '0')
              )?.[0]
              ?.getAttribute('data-group') || '0'
          )
        }

        // NOTE:
        // this is working to shift MAIN to ELLIPSIS
        // need to setup shifting ELLIPSIS to MAIN
        //
        // note: the ordering of the groups is important when appending them
        // and that currently isn't being tracked (current setup is appending only)
        console.log({ ellipsisMenuGroups })
        console.log({ editorMenuGroups })
        const lastGroupIndexInEllipsisMenu = getGroupIndex(
          ellipsisMenuGroups,
          'asc'
        )
        const lastGroupIndexInMainMenu = lastGroupIndexInEllipsisMenu
          ? lastGroupIndexInEllipsisMenu - 1
          : getGroupIndex(editorMenuGroups, 'dsc')
        console.log({ lastGroupIndexInMainMenu })
        console.log({ lastGroupIndexInEllipsisMenu })

        // tests are below, can be moved into a good setup config
        // once i get it all working and see the pattern
        if (width < 700 && lastGroupIndexInMainMenu === 4) {
          const ellipsisMenu = document.querySelector(
            '.editor-ellipsis-menu-hidden'
          )
          const lastGroup = document.querySelectorAll(
            `#menu-group-${lastGroupIndexInMainMenu}`
          )
          if (ellipsisMenu && lastGroup.length) {
            lastGroup.forEach((group) => ellipsisMenu.appendChild(group))
          }
        }

        if (width < 600 && lastGroupIndexInMainMenu === 3) {
          const ellipsisMenu = document.querySelector(
            '.editor-ellipsis-menu-hidden'
          )
          const lastGroup = document.querySelectorAll(
            `#menu-group-${lastGroupIndexInMainMenu}`
          )
          if (ellipsisMenu && lastGroup.length) {
            lastGroup.forEach((group) => ellipsisMenu.appendChild(group))
          }
        }

        if (width < 500 && lastGroupIndexInMainMenu === 2) {
          const ellipsisMenu = document.querySelector(
            '.editor-ellipsis-menu-hidden'
          )
          const lastGroup = document.querySelectorAll(
            `#menu-group-${lastGroupIndexInMainMenu}`
          )
          if (ellipsisMenu && lastGroup.length) {
            lastGroup.forEach((group) => ellipsisMenu.appendChild(group))
          }
        }

        // todo: based on the width of #main, we're going to apply different classes
        // to the editor, title, and menu.
        // the most important now is:
        // MENU
        // TITLE
        // as editor is pretty responsive already
        //
        //TODO
        // for the menu bar, create a new button that holds most of the buttons
        // under an ellipsis menu that opens a popout that includes all the buttons.
        // - it will always be in the DOM, but hidden unless the div is small
      }
      this.resizeObserver = new ResizeObserver(handleResize)
      this.resizeObserver.observe(container)
    }

    const resetContainers = () => {
      this.editorTitleContainer = null
      this.editorMenuContainer = null
      this.editorContainer = null

      const editorTitleDiv = document.createElement('div')
      editorTitleDiv.id = 'editor-title-container'
      const editorMenuDiv = document.createElement('div')
      editorMenuDiv.id = 'editor-menu'
      const editorDiv = document.createElement('div')
      editorDiv.id = 'editor'

      container?.appendChild(editorTitleDiv)
      container?.appendChild(editorMenuDiv)
      container?.appendChild(editorDiv)

      this.editorTitleContainer = editorTitleDiv
      this.editorMenuContainer = editorMenuDiv
      this.editorContainer = editorDiv
    }

    resetResizeObserver(container)
    resetContainers()

    this.isDirty = false
    const tipTap = this.instantiateTipTap(this.note)
    if (tipTap) this.editor = tipTap
    this.renderMenu()
    // only render title if there is a note
    // and only have the editor enabled if there is a note
    if (this.note) this.updateTitle(this.note.title)
    if (!this.note) this.setDisabled(true)
  }

  public renderMenu(isDisabled = false) {
    if (!this.editorMenuContainer) return

    const createButtonGroups = (button: HTMLButtonElement) => {
      if (isDisabled) button.disabled = true
      const group = button.dataset.group
      if (!group) throw new Error('button is not assigned to a group')

      const groupId = `menu-group-${group}`
      let groupContainer = document.querySelector(`#${groupId}`)
      if (!groupContainer) {
        groupContainer = document.createElement('div')
        groupContainer.id = groupId
      }
      groupContainer.appendChild(button)
      return groupContainer
    }

    this.editorMenuContainer.innerHTML = '' // reset container before rendering

    const buttons = instantiateMenuButtons(this.editor)
    buttons
      .map(createButtonGroups)
      .forEach((groupContainer) =>
        this.editorMenuContainer?.appendChild(groupContainer)
      )

    // TODO: once the moving into the containers is working properly
    // add the ellipsis button itself that will open toggle the hidden menu
    const ellipsisMenu = document.createElement('div')
    ellipsisMenu.classList.add('editor-ellipsis-menu-hidden')

    this.editorMenuContainer.appendChild(ellipsisMenu)
  }

  public getIsDirty() {
    return this.isDirty
  }

  public getContent() {
    return this.editor?.getHTML() ?? ''
  }

  public setNote(note: Note | null) {
    console.log('NOTE SET')
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

  private updateTitle(title: string) {
    if (!this.editorTitleContainer) return
    this.editorTitleContainer.innerHTML = ''

    const span = document.createElement('span')
    span.appendChild(document.createTextNode(title))
    span.classList.add(title ? 'editor-title' : 'editor-title-disabled')

    this.editorTitleContainer?.appendChild(
      new Button({
        testId: 'edit-title-button',
        title: 'Edit title',
        html: span.outerHTML, // inject the full span element
        style: { border: 'none', width: 'inherit' },
        onClick: () => {
          this.renderTitleEdit(this.editorTitleContainer as Element)
        },
      }).getElement()
    )
  }

  private renderTitleEdit(titleEditContainer: Element) {
    titleEditContainer.innerHTML = ''

    const instantiateInput = () => {
      if (!this.note) throw new Error('Note not set')
      let inputValue = this.note.title

      // todo: use a custom input for this?
      // because I DO NOT want a title here
      // The layout CANNOT shift when we swap inputs
      const inputInstance = new Input({
        testId: 'edit-title-input',
        id: 'edit-title',
        label: '', // TODO: consider how to handle this in an accessible way
        placeholder: 'Note title',
        value: inputValue,
      })

      const input = inputInstance.getInput()

      input.onblur = () => {
        const isValueEmpty = inputValue?.trim() === ''
        const wasTitleChanged = this.note?.title !== inputValue

        if (isValueEmpty || !wasTitleChanged)
          // close input, and render title again
          this.updateTitle(this.note?.title || 'Error')

        const canUpdate = wasTitleChanged && !isValueEmpty

        if (canUpdate)
          createEvent(NoteEvents.UpdateTitle, {
            title: inputValue.trim(),
          }).dispatch()
      }

      // TODO: on ENTER click, call the onblur's function

      input.addEventListener('input', (event) => {
        if (!this.note) throw new Error('Note not set')
        inputValue = (event.target as HTMLInputElement)?.value || ''
      })

      return { input, inputContainer: inputInstance.getContainer() }
    }

    const { input, inputContainer } = instantiateInput()

    titleEditContainer.appendChild(inputContainer)

    input.focus()
  }

  private instantiateTipTap(note: Note | null) {
    if (!this.editorContainer) return
    const editor = new TipTapEditor({
      element: this.editorContainer,
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
