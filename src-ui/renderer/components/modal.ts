import { ModalEvents, createEvent } from 'event'
import { closeIcon } from 'icons'
import './modal.css'

// NEEDS TESTS AND TO BE REFACTORED
// as it's complex with opening/closing
// and how the modal events relate to the main application state
// ie (who controls who as they both can control each other)

/**
 * Renders a modal with the given title and content.
 * Handles open and close events along with trapping focus inside the modal
 *
 * @param title - Modal title
 * @param content - Modal content of any html element
 * @param url - Url param for this modal
 */
function renderModal({
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
  const modalBackdrop = document.getElementById('modal-backdrop')
  const modal = document.getElementById('modal')
  const modalCloseButton = document.getElementById(
    'modal-close'
  ) as HTMLButtonElement
  const modalTitle = document.getElementById('modal-title')
  const modalContent = document.getElementById('modal-content')

  if (
    !modalBackdrop ||
    !modal ||
    !modalCloseButton ||
    !modalTitle ||
    !modalContent
  )
    throw new Error('modal missing required element')

  if (classList) modal.classList.add(classList)

  modalTitle.innerText = title

  modalCloseButton.innerHTML = closeIcon

  // Remove any existing children in modalContent
  // to clear its state
  while (modalContent.firstChild) {
    modalContent.removeChild(modalContent.firstChild)
  }

  modalContent.appendChild(content)
  openModal(modalBackdrop, modal, modalCloseButton, url, classList)
}

/**
 * Opens modal, sets focus inside it and adds listeners
 */
function openModal(
  modalBackdrop: HTMLElement,
  modal: HTMLElement,
  closeButton: HTMLButtonElement,
  url: string,
  classList?: string
) {
  createEvent(ModalEvents.Open, { param: url })?.dispatch()
  // Save last focused element outside of modal to restore focus on modal close
  const previouslyFocusedOutsideModalElement =
    document.activeElement as HTMLElement
  closeButton.onclick = () => closeModal(classList)
  modalBackdrop.style.display = 'block' // shows modal

  modal.addEventListener('keydown', trapFocusListener)
  modal.addEventListener('keydown', escapePressListener)

  // Allows for closing the modal by any other event
  window.addEventListener(ModalEvents.Close, closeModalFromEvent)

  /**
   * Cleanup listeners and restore focus
   */
  function closeModal(classList?: string) {
    if (classList) modal.classList.remove(classList)
    modalBackdrop.style.display = 'none'
    modal.removeEventListener('keydown', trapFocusListener)
    modal.removeEventListener('keydown', escapePressListener)
    window.removeEventListener(ModalEvents.Close, closeModalFromEvent)

    if (previouslyFocusedOutsideModalElement)
      previouslyFocusedOutsideModalElement?.focus()

    // This event is to relay that the modal has been closed
    // so application state can be updated.
    // Whether the closing was done by the modal itself or another component
    // does not matter.
    createEvent(ModalEvents.Close)?.dispatch()
  }

  function trapFocusListener(event: KeyboardEvent) {
    trapFocus(modal, event)
  }

  function escapePressListener(event: KeyboardEvent) {
    if (event.key === 'Escape') closeModal(classList)
  }

  function closeModalFromEvent() {
    closeModal(classList)
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

export { renderModal }
