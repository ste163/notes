import { DialogEvents, createEvent } from 'event'
import { closeIcon } from 'icons'
import './dialog.css'

// NEEDS TESTS AND TO BE REFACTORED
// as it's complex with opening/closing
// and how the dialog events relate to the main application state
// ie (who controls who as they both can control each other)

/**
 * To break the dialog out:
 * it includes a renderDialog function
 * that checks the HTML was generated (can be removed by the class instantionation)
 * and then sets content and THEN opens it.
 *
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

/**
 * Renders a dialog with the given title and content.
 * Handles open and close events along with trapping focus inside the dialog
 *
 * @param title - Dialog title
 * @param content - Dialog content of any html element
 * @param url - Url param for this dialog
 */
function renderDialog({
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
  const dialogBackdrop = document.getElementById('dialog-backdrop')
  const dialog = document.getElementById('dialog')
  const dialogCloseButton = document.getElementById(
    'dialog-close'
  ) as HTMLButtonElement
  const dialogTitle = document.getElementById('dialog-title')
  const dialogContent = document.getElementById('dialog-content')

  if (
    !dialogBackdrop ||
    !dialog ||
    !dialogCloseButton ||
    !dialogTitle ||
    !dialogContent
  )
    throw new Error('dialog missing required element')

  if (classList) dialog.classList.add(classList)

  dialogTitle.innerText = title

  dialogCloseButton.innerHTML = closeIcon

  // Remove any existing children in dialogContent
  // to clear its state
  while (dialogContent.firstChild) {
    dialogContent.removeChild(dialogContent.firstChild)
  }

  dialogContent.appendChild(content)
  openDialog(dialogBackdrop, dialog, dialogCloseButton, url, classList)
}

/**
 * Opens dialog, sets focus inside it and adds listeners
 */
function openDialog(
  dialogBackdrop: HTMLElement,
  dialog: HTMLElement,
  closeButton: HTMLButtonElement,
  url: string,
  classList?: string
) {
  createEvent(DialogEvents.Open, { param: url })?.dispatch()
  // Save last focused element outside of dialog to restore focus on dialog close
  const previouslyFocusedOutsideDialogElement =
    document.activeElement as HTMLElement
  closeButton.onclick = () => closeDialog(classList)
  dialogBackdrop.style.display = 'block' // shows dialog

  dialog.addEventListener('keydown', trapFocusListener)
  dialog.addEventListener('keydown', escapePressListener)

  // Allows for closing the dialog by any other event
  window.addEventListener(DialogEvents.Close, closeDialogFromEvent)

  /**
   * Cleanup listeners and restore focus
   */
  function closeDialog(classList?: string) {
    if (classList) dialog.classList.remove(classList)
    dialogBackdrop.style.display = 'none'
    dialog.removeEventListener('keydown', trapFocusListener)
    dialog.removeEventListener('keydown', escapePressListener)
    window.removeEventListener(DialogEvents.Close, closeDialogFromEvent)

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
    if (event.key === 'Escape') closeDialog(classList)
  }

  function closeDialogFromEvent() {
    closeDialog(classList)
  }
}

/**
 * Traps keyboard focus inside the container element
 */
function trapFocus(container: HTMLElement, event: KeyboardEvent) {
  // Get the first and last focusable elements inside the container
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement

  if (event.shiftKey && document.activeElement === firstFocusable) {
    event.preventDefault()
    lastFocusable.focus()
  }
  if (event.key === 'Tab' && document.activeElement === lastFocusable) {
    event.preventDefault()
    firstFocusable.focus()
  }
}

export { renderDialog }
