import { nanoid } from 'nanoid'
import { LifeCycleEvents, createEvent } from 'event'
import { closeIcon } from 'icons'
import { trapFocus } from './trap-focus'
import type { DIALOGS } from 'const'
import './dialog.css'

type QueryParam = (typeof DIALOGS)[keyof typeof DIALOGS]

class Dialog {
  private id: string = nanoid()
  private queryParam: QueryParam | null = null
  private dialog: HTMLDivElement
  private dialogBackdrop: HTMLElement
  private previouslyFocusedOutsideElement: HTMLElement | null = null

  constructor() {
    this.init()

    this.dialog = document.querySelector(`#dialog-${this.id}`) as HTMLDivElement
    this.dialogBackdrop = document.querySelector(
      `#dialog-backdrop-${this.id}`
    ) as HTMLDivElement
    const closeButton = document.querySelector(
      `#dialog-close-${this.id}`
    ) as HTMLButtonElement

    closeButton.onclick = () => this.close()
  }

  public init() {
    const dialogBackdrop = document.createElement('div')
    dialogBackdrop.id = `dialog-backdrop-${this.id}`
    dialogBackdrop.tabIndex = -1
    dialogBackdrop.setAttribute('readonly', 'readonly')
    dialogBackdrop.classList.add('dialog-backdrop')
    dialogBackdrop.innerHTML = `
    <div
      id="dialog-${this.id}"
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      tabindex="-1"
      readonly="readonly"
    >
      <div role="document">
        <header id="dialog-header-${this.id}" class="dialog-header">
          <h2 id="dialog-title-${this.id}" class="dialog-title">Title</h2>
          <button testid="dialog-close" id="dialog-close-${this.id}" class="dialog-close">${closeIcon}</button>
        </header>
        <div id="dialog-content-${this.id}" class="dialog-content"></div>
      </div>
    </div>`

    if (document.body.firstChild)
      document.body.insertBefore(dialogBackdrop, document.body.firstChild)
    else document.body.appendChild(dialogBackdrop)
  }

  private trapFocusListener = (event: KeyboardEvent) => {
    trapFocus(this.dialog, event)
  }

  private escapePressListener = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.close()
  }

  public setContent({
    title,
    content,
    queryParam,
    classList,
  }: {
    title: string
    content: HTMLElement
    queryParam: QueryParam
    classList?: string
  }) {
    this.queryParam = queryParam
    if (classList) this.dialog?.classList.add(classList)
    const dialogTitle = document.getElementById(`dialog-title-${this.id}`)
    if (dialogTitle) dialogTitle.innerText = title
    document.getElementById(`dialog-content-${this.id}`)?.appendChild(content)
  }

  public open() {
    this.previouslyFocusedOutsideElement =
      document.activeElement as HTMLElement | null

    document.body.style.userSelect = 'none' // disallow selecting text behind dialog
    this.dialogBackdrop.style.display = 'block' // shows dialog

    this.dialog.addEventListener('keydown', this.trapFocusListener)
    this.dialog.addEventListener('keydown', this.escapePressListener)

    createEvent(LifeCycleEvents.OpenedDialog, {
      dialog: this.queryParam,
    })?.dispatch()
  }

  public close() {
    document.body.style.userSelect = 'text' // re-enable selecting text
    this.delete()
    if (this.previouslyFocusedOutsideElement)
      this.previouslyFocusedOutsideElement.focus()
    createEvent(LifeCycleEvents.QueryParamUpdate, { dialog: null })?.dispatch()
  }

  public delete() {
    if (this.dialogBackdrop && this.dialogBackdrop?.parentNode) {
      this.dialogBackdrop.parentNode.removeChild(this.dialogBackdrop)
    }
  }
}

export { Dialog }
