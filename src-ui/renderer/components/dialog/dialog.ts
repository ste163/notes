import { DialogEvents, createEvent } from 'event'
import { closeIcon } from 'icons'
import { trapFocus } from './trap-focus'
import './dialog.css'

/**
 * The other functions are to handle the navigation when the dialog is open
 * But these should simply call events to the main application instead of ALSO
 * calling legit functions.
 *
 * This function should only say "Hey, open me!" (with this data as something optional)
 * or "Hey, close me!"
 *
 * Then the tests are for rendering that the content is there
 * and that the events are called correctly
 */

// TODO: bug fix
// if the backdrop is selected, then the escape press should close dialog

class Dialog {
  private classList: string
  private url: string
  private dialog: HTMLDivElement | null
  private dialogBackdrop: HTMLElement | null // THIS CONTAINS EVERY ELEMENT: potentially could grab the dialog and close from this?
  private closeButton: HTMLButtonElement | null

  constructor() {
    this.classList = ''
    this.url = ''
    this.dialog = null
    this.dialogBackdrop = null
    this.closeButton = null
    this.init()
  }

  public init() {
    const body = document.body

    const dialogBackdrop = document.createElement('div')
    // this approach could support multiple dialogs
    // however, that is not implemented, and would require
    // unique ids per dialog
    dialogBackdrop.id = 'dialog-backdrop'
    dialogBackdrop.tabIndex = -1
    dialogBackdrop.setAttribute('readonly', 'readonly')

    dialogBackdrop.innerHTML = ''
    dialogBackdrop.innerHTML = `
    <div
      id="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      tabindex="-1"
      readonly="readonly"
    >
      <div role="document">
        <header id="dialog-header">
          <h2 id="dialog-title">Title</h2>
          <button id="dialog-close"></button>
        </header>
        <div id="dialog-content"></div>
      </div>
    </div>`

    this.dialogBackdrop = dialogBackdrop
    this.dialog = dialogBackdrop.querySelector('#dialog') as HTMLDivElement
    this.closeButton = dialogBackdrop.querySelector(
      '#dialog-close'
    ) as HTMLButtonElement

    body.firstChild
      ? body.insertBefore(dialogBackdrop, body.firstChild)
      : body.appendChild(dialogBackdrop)
  }

  /**
   * TODO:
   * Split out into separate functions based on events
   */
  private open() {
    const dialog = this.dialog as HTMLDivElement
    const dialogBackdrop = this.dialogBackdrop as HTMLElement
    const classList = this.classList
    createEvent(DialogEvents.Open, { param: this.url })?.dispatch()
    // Save last focused element outside of dialog to restore focus on dialog close
    const previouslyFocusedOutsideDialogElement =
      document.activeElement as HTMLElement
    this.closeButton!.onclick = () => closeDialog()
    dialogBackdrop.style.display = 'block' // shows dialog

    dialog.addEventListener('keydown', trapFocusListener)
    dialog.addEventListener('keydown', escapePressListener)

    // Allows for closing the dialog by any other event
    window.addEventListener(DialogEvents.Close, closeDialogFromEvent) // this must be the only way to close dialog

    /**
     * Cleanup listeners and restore focus
     */
    function closeDialog() {
      if (classList) dialog.classList.remove(classList)
      dialogBackdrop.style.display = 'none'
      dialog.removeEventListener('keydown', trapFocusListener)
      dialog.removeEventListener('keydown', escapePressListener)
      window.removeEventListener(DialogEvents.Close, closeDialogFromEvent) // this should be the only way to close dialog

      if (previouslyFocusedOutsideDialogElement)
        previouslyFocusedOutsideDialogElement?.focus()

      // This event is to relay that the dialog has been closed
      // so application state can be updated.
      // Whether the closing was done by the dialog itself or another component
      // does not matter.
      createEvent(DialogEvents.Close)?.dispatch()
    }

    function trapFocusListener(event: KeyboardEvent) {
      trapFocus(dialog, event)
    }

    function escapePressListener(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDialog()
    }

    // TODO: this should be the ONLY way to close the dialog
    function closeDialogFromEvent() {
      closeDialog()
    }
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
    this.init() // reset instance whenever content changes
    this.url = url

    if (classList) {
      this.classList = classList
      this.dialog?.classList.add(classList)
    }

    this.closeButton!.innerHTML = closeIcon
    document.getElementById('dialog-title')!.innerText = title
    document.getElementById('dialog-content')!.appendChild(content)

    // TODO: move openDialog out to a separate function
    // ALSO: setContent DOES NOT CALL OPEN
    // a separate function is dialog.open
    this.open()
  }
}

const dialog = new Dialog()

export { dialog }
