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
import { ellipsisIcon } from 'icons'
import type { MarkOptions, Note } from 'types'
import type { FocusPosition } from '@tiptap/core'
import './editor.css'

interface ResponsivenessConfig {
  width: number
  groupIndex: number
}

const responsivenessConfig: ResponsivenessConfig[] = [
  {
    width: 700,
    groupIndex: 4,
  },
  {
    width: 600,
    groupIndex: 3,
  },
  {
    width: 500,
    groupIndex: 2,
  },
]

const NO_NOTE_CONTENT = `<h1>Get started</h1><p>Create or select a note from the sidebar.</p>`

// NOTE:
// some of this could be moved into sub classes.
// ie: a EditorRenderer class that handles the rendering
// that inherits from the main Editor that instantiates TipTap?
class Editor {
  private editor: TipTapEditor | null = null
  private note: Note | null = null
  private saveTimer: NodeJS.Timeout | null = null
  private isDirty = false

  private globalClickHandler: (event: MouseEvent) => void = () => {}
  private resizeObserver: ResizeObserver | null = null
  private editorTitleContainer: HTMLDivElement | null = null
  private editorMenuContainer: HTMLDivElement | null = null
  private editorMenuMainContainer: HTMLDivElement | null = null
  private editorMenuEllipsisContainer: HTMLDivElement | null = null
  private editorContainer: HTMLDivElement | null = null

  /**
   * Initial setup for the editor elements.
   *
   * All renders after this point only modify specific elements
   */
  constructor() {
    const container = document.querySelector('#main')
    if (!container) throw new Error('Main container not found')

    container.innerHTML = ''

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

  public render() {
    const container = document.querySelector('#main')
    if (!container) throw new Error('Main container not found')

    /**
     * Resets only the Title and Content,
     * but not the editor menu buttons as those
     * are independent of the selected Note
     */
    const resetContainers = () => {
      const editorTitle = document.querySelector('#editor-title-container')
      const editorContent = document.querySelector('#editor')

      if (!editorTitle || !editorContent) return

      editorTitle.innerHTML = ''
      editorContent.innerHTML = ''
    }

    this.resetResizeObserver()
    resetContainers()

    const tipTap = this.instantiateTipTap(this.note)
    if (tipTap) this.editor = tipTap
    this.renderMenu()
    // only render title if there is a note
    // and only have the editor enabled if there is a note
    if (this.note) this.updateTitle(this.note.title)
    if (!this.note) this.setDisabled(true)
    this.isDirty = false
  }

  public renderMenu(isDisabled = false) {
    if (!this.editorMenuContainer) return

    // If it is a subsequent re-render
    // then enable/disable buttons instead of a full re-render
    const renderedButtons = document.querySelectorAll(
      '.editor-menu-button'
    ) as NodeListOf<HTMLButtonElement>
    if (renderedButtons.length) {
      renderedButtons.forEach((button) => {
        button.disabled = isDisabled
      })
      return
    }

    const createButtonGroups = (button: HTMLButtonElement) => {
      button.classList.add('editor-menu-button')
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

    const mainButtonDiv = document.createElement('div')
    mainButtonDiv.id = 'main-editor-button-section'
    mainButtonDiv.setAttribute('data-testid', 'main-editor-button-section')
    this.editorMenuMainContainer = mainButtonDiv

    const buttons = instantiateMenuButtons(this.editor)
    buttons
      .map(createButtonGroups)
      .forEach((groupContainer) => mainButtonDiv?.appendChild(groupContainer))

    const createEllipsisElement = () => {
      const ellipsisMenu = document.createElement('div')
      ellipsisMenu.id = 'ellipsis-editor-menu'
      ellipsisMenu.setAttribute('data-testid', 'ellipsis-editor-button-section')
      return ellipsisMenu
    }

    this.editorMenuEllipsisContainer = createEllipsisElement()

    // cleanup listener on any re-render, just in case
    this.removeGlobalPopOutListener()

    const ellipsisButton = new Button({
      id: 'ellipsis-button',
      testId: 'ellipsis-button',
      title: 'More options',
      html: `${ellipsisIcon}
              <div id='ellipsis-pop-out'></div>`,
      className: 'editor-menu-button',
      onClick: (event: Event) => {
        event.stopPropagation()
        this.toggleEllipsisPopOut()
      },
    }).getElement()

    this.editorMenuContainer.appendChild(this.editorMenuMainContainer)
    this.editorMenuContainer.appendChild(ellipsisButton)

    // need to append the ellipsis menu to the ellipsis button
    const ellipsisPopOut = document.querySelector('#ellipsis-pop-out')
    ellipsisPopOut?.appendChild(this.editorMenuEllipsisContainer)
  }

  public getIsDirty() {
    return this.isDirty
  }

  public setIsDirty(isDirty: boolean) {
    this.isDirty = isDirty
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
    // this triggers the re-rendering of the menu buttons
    // into their correct containers after they have been enabled/disabled
    this.resetResizeObserver()
  }

  public setCursorPosition(position: FocusPosition) {
    this.editor?.commands.focus(position)
  }

  private resetResizeObserver() {
    function debounce(
      func: (args: ResizeObserverEntry[]) => void,
      wait: number
    ) {
      let timeout: NodeJS.Timeout
      return (args: ResizeObserverEntry[]) => {
        const later = () => {
          clearTimeout(timeout)
          func(args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }

    const container = document.querySelector('#main')
    if (!container) return
    if (this.resizeObserver) this.resizeObserver.disconnect()
    const handleResize = (entries: ResizeObserverEntry[]) => {
      const main = entries[0] // only watching the #main element
      const editorWidth = main.contentRect.width

      const getEditorMenuGroups = () =>
        this.editorMenuMainContainer?.querySelectorAll('[data-group]')

      const getEllipsisMenuGroups = () =>
        this.editorMenuEllipsisContainer?.querySelectorAll('[data-group]')

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

      const showHideEllipsisButton = () => {
        const ellipsisButton = document.querySelector(
          '#ellipsis-button'
        ) as HTMLElement

        if (!getEllipsisMenuGroups() || !ellipsisButton) return

        const doesEllipsisMenuHaveItems = !!getGroupIndex(
          getEllipsisMenuGroups(),
          'asc'
        )

        ellipsisButton.style.display = doesEllipsisMenuHaveItems
          ? 'flex'
          : 'none'
      }

      const processResponsiveConfig = ({
        width,
        groupIndex,
      }: ResponsivenessConfig) => {
        const getLastGroupElements = (index: number) =>
          document.querySelectorAll(`#menu-group-${index}`)

        const startingIndexInEllipsis = getGroupIndex(
          getEllipsisMenuGroups(),
          'asc'
        )
        const getLastGroupIndexInMainMenu = () =>
          startingIndexInEllipsis
            ? startingIndexInEllipsis - 1
            : getGroupIndex(getEditorMenuGroups(), 'dsc')

        // process main menu
        const lastMainIndex = getLastGroupIndexInMainMenu()
        const shouldMoveButtonsIntoEllipsis =
          editorWidth < width &&
          lastMainIndex === groupIndex &&
          getLastGroupElements(lastMainIndex).length
        if (shouldMoveButtonsIntoEllipsis) {
          // put the items in the ellipsis menu in the correct order.
          // Must .reverse() and .prepend() to ensure the order becomes:
          // H1, H2, H3 in the main menu and consistent in the ellipsis menu
          const groups = Array.from(getLastGroupElements(lastMainIndex))
          groups.reverse().forEach((group) => {
            this.editorMenuEllipsisContainer?.prepend(group)
          })
        }

        // process ellipsis menu
        const lastIndexInEllipsis = getGroupIndex(
          getEllipsisMenuGroups(),
          'asc'
        )
        const shouldMoveButtonsOutOfEllipsis =
          editorWidth > width &&
          lastIndexInEllipsis === groupIndex &&
          getLastGroupElements(lastIndexInEllipsis).length
        if (shouldMoveButtonsOutOfEllipsis)
          getLastGroupElements(lastIndexInEllipsis).forEach((group) =>
            this.editorMenuMainContainer?.appendChild(group)
          )
      }
      /**
       * Process the width of the editor element
       * and move editor buttons to the main or
       * ellipsis/overflow menus
       */

      // potential solution: as long as the editorWidth is greater
      // than the lowest responsiveConfig width, continue to process
      // the config? Why? Because we should be continuously processing the config
      // not just once, but based on the actual editor width

      responsivenessConfig.forEach(processResponsiveConfig)

      // TODO (bug to solve for): and this horribly solves it.
      // When the sidebar is opened at it's fullest
      // and then closed, the ellipsis menu will still render.
      // Why? Because we only loop through once and process
      // the config on the current screen size. So it's not
      // moving all the items out. By running it 3 times,
      // we always ensure it is processed
      // this needs to be resolved in a better way
      // that only calls the function once
      //
      // e2e is in place to track this bug
      if (editorWidth > 700)
        responsivenessConfig.forEach(processResponsiveConfig)
      if (editorWidth > 500)
        responsivenessConfig.forEach(processResponsiveConfig)

      showHideEllipsisButton()

      // TODO: resize very long titles and the title input
    }

    // must debounce the resize handler by some amount or else e2e fails
    const debouncedResizeHandler = debounce(handleResize, 5)
    this.resizeObserver = new ResizeObserver(debouncedResizeHandler)
    this.resizeObserver.observe(container)
  }

  private toggleEllipsisPopOut() {
    const ellipsisPopOut = document.querySelector('#ellipsis-pop-out')
    const isVisible = ellipsisPopOut?.classList.toggle('show-ellipsis-pop-out')
    isVisible
      ? this.addGlobalPopOutListener()
      : this.removeGlobalPopOutListener()
  }

  private addGlobalPopOutListener() {
    this.globalClickHandler = (event: MouseEvent) => {
      const ellipsisPopOut = document.querySelector('#ellipsis-pop-out')
      if (!ellipsisPopOut?.contains(event.target as Node)) {
        ellipsisPopOut?.classList.remove('show-ellipsis-pop-out')
        this.removeGlobalPopOutListener()
      }
    }
    document.addEventListener('click', this.globalClickHandler)
  }

  private removeGlobalPopOutListener() {
    document.removeEventListener('click', this.globalClickHandler)
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
      let isOnBlurSaveEnabled = true

      const inputInstance = new Input({
        testId: 'edit-title-input',
        id: 'edit-title',
        label: 'Edit title',
        isLabelHidden: true,
        placeholder: 'Note title',
        value: inputValue,
      })

      const input = inputInstance.getInput()

      const attemptSaveOrReset = () => {
        const hasValue = inputValue?.trim() !== ''
        const wasTitleChanged = this.note?.title !== inputValue
        const canUpdate = wasTitleChanged && hasValue
        canUpdate
          ? createEvent(NoteEvents.UpdateTitle, {
              title: inputValue.trim(),
            }).dispatch()
          : this.updateTitle(this.note?.title || 'Error')
      }

      input.onblur = () => isOnBlurSaveEnabled && attemptSaveOrReset()

      input.addEventListener('keydown', ({ key }) => {
        const keyMap: Record<string, () => void> = {
          ['Enter']: () => {
            isOnBlurSaveEnabled = false
            attemptSaveOrReset()
          },
          ['Escape']: () => {
            isOnBlurSaveEnabled = false
            this.updateTitle(this.note?.title || 'Error')
          },
        }
        keyMap[key] && keyMap[key]()
      })

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
      content: note?.content ?? NO_NOTE_CONTENT,
      onUpdate: ({ transaction }) => {
        this.isDirty = transaction.docChanged
        const debounceSave = () => {
          if (this.saveTimer) clearTimeout(this.saveTimer)
          this.saveTimer = setTimeout(() => {
            createEvent(NoteEvents.Save, {
              shouldShowNotification: false,
            }).dispatch()
          }, 300)
        }
        if (this.isDirty) debounceSave()
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

export { Editor }
