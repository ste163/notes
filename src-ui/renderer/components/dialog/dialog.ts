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

class Dialog {
  // TODO
  // instead of passing a bunch of props around
  // assign the variables here

  private classList: string
  private url: string

  constructor() {
    this.classList = ''
    this.url = ''
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

    body.firstChild
      ? body.insertBefore(dialogBackdrop, body.firstChild)
      : body.appendChild(dialogBackdrop)
  }

  /**
   * TODO:
   * Split out into separate functions based on events
   */
  private open(
    dialogBackdrop: HTMLElement,
    dialog: HTMLElement,
    closeButton: HTMLButtonElement
  ) {
    createEvent(DialogEvents.Open, { param: this.url })?.dispatch()
    // Save last focused element outside of dialog to restore focus on dialog close
    const previouslyFocusedOutsideDialogElement =
      document.activeElement as HTMLElement
    closeButton.onclick = () => closeDialog(this.classList)
    dialogBackdrop.style.display = 'block' // shows dialog

    dialog.addEventListener('keydown', trapFocusListener)
    dialog.addEventListener('keydown', escapePressListener)

    // Allows for closing the dialog by any other event
    window.addEventListener(DialogEvents.Close, closeDialogFromEvent) // this must be the only way to close dialog

    /**
     * Cleanup listeners and restore focus
     */
    function closeDialog(classList?: string) {
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

    const dialogBackdrop = document.getElementById('dialog-backdrop')
    const dialog = document.getElementById('dialog')
    const dialogCloseButton = document.getElementById(
      'dialog-close'
    ) as HTMLButtonElement
    const dialogContent = document.getElementById('dialog-content')

    if (classList) {
      this.classList = classList
      dialog?.classList.add(classList)
    }

    document.getElementById('dialog-title')!.innerText = title
    dialogCloseButton.innerHTML = closeIcon

    dialogContent!.appendChild(content)

    // TODO: move openDialog out to a separate function
    // ALSO: setContent DOES NOT CALL OPEN
    // a separate function is dialog.open

    // ALSO, the open function should NOT pass elements in. These elements should be private vars
    this.open(
      dialogBackdrop as HTMLElement,
      dialog as HTMLElement,
      dialogCloseButton
    )
  }
}

const dialog = new Dialog()

export { dialog }
