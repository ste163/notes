import { nanoid } from 'nanoid'
import { DialogEvents, createEvent } from 'event'
import { closeIcon } from 'icons'
import { trapFocus } from './trap-focus'
import './dialog.css'

class Dialog {
  private id: string = nanoid()
  private url: string = ''
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
          <button id="dialog-close-${this.id}" class="dialog-close">${closeIcon}</button>
        </header>
        <div id="dialog-content-${this.id}" class="dialog-content"></div>
      </div>
    </div>`

    document.body.firstChild
      ? document.body.insertBefore(dialogBackdrop, document.body.firstChild)
      : document.body.appendChild(dialogBackdrop)
  }

  private trapFocusListener = (event: KeyboardEvent) => {
    trapFocus(this.dialog, event)
  }

  private escapePressListener = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.close()
  }

  private closeDialogFromEvent = () => {
    this.close()
  }

  public setContent({
    title,
    content,
    url,
    classList,
  }: {
    title: string
    content: HTMLElement
    url: string
    classList?: string
  }) {
    this.url = url
    if (classList) this.dialog?.classList.add(classList)
    document.getElementById(`dialog-title-${this.id}`)!.innerText = title
    document.getElementById(`dialog-content-${this.id}`)!.appendChild(content)
  }

  public open() {
    this.previouslyFocusedOutsideElement =
      document.activeElement as HTMLElement | null

    document.body.style.userSelect = 'none' // disallow selecting text behind dialog
    this.dialogBackdrop.style.display = 'block' // shows dialog

    this.dialog.addEventListener('keydown', this.trapFocusListener)
    this.dialog.addEventListener('keydown', this.escapePressListener)
    window.addEventListener(DialogEvents.Closed, this.closeDialogFromEvent)

    createEvent(DialogEvents.Opened, { param: this.url })?.dispatch()
  }

  public close() {
    window.removeEventListener(DialogEvents.Closed, this.closeDialogFromEvent)
    document.body.style.userSelect = 'text' // re-enable selecting text
    this.delete()
    if (this.previouslyFocusedOutsideElement)
      this.previouslyFocusedOutsideElement.focus()

    createEvent(DialogEvents.Closed)?.dispatch()
  }

  public delete() {
    if (this.dialogBackdrop && this.dialogBackdrop?.parentNode) {
      this.dialogBackdrop.parentNode.removeChild(this.dialogBackdrop)
    }
  }
}

export { Dialog }
