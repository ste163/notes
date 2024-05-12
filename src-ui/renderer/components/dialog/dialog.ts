import { nanoid } from 'nanoid'
import { DialogEvents, createEvent } from 'event'
import { closeIcon } from 'icons'
import { trapFocus } from './trap-focus'
import './dialog.css'

// BUG TO FIX
// When the dialog is open, I can still highlight text behind it with ctrl+a. Can I disable that?

// GitHub Copilot
// Yes, you can disable text selection behind the dialog when it's open. You can achieve this by applying a CSS rule to the body or the parent container when the dialog is open.

// Here's how you can do it:

// body.dialog-open {
//   user-select: none;
// }

// In this code, user-select: none disables text selection. You should add the dialog-open class to the body when the dialog is open, and remove it when the dialog is closed.
// Please note that this will disable text selection for the entire page. If you want to allow text selection within the dialog, you can override this rule for the dialog:
// body.dialog-open .dialog {
//   user-select: text;
// }
// In this code, user-select: text enables text selection within the dialog, even when text selection is disabled for the rest of the page.

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

    this.dialogBackdrop.style.display = 'block' // shows dialog

    this.dialog.addEventListener('keydown', this.trapFocusListener)
    this.dialog.addEventListener('keydown', this.escapePressListener)
    window.addEventListener(DialogEvents.Closed, this.closeDialogFromEvent)

    createEvent(DialogEvents.Opened, { param: this.url })?.dispatch()
  }

  public close() {
    window.removeEventListener(DialogEvents.Closed, this.closeDialogFromEvent)
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
