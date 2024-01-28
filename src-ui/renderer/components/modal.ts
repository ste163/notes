import { ModalEvents, createEvent } from 'event'
import './modal.css'

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

  modalCloseButton.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>Close Modal</title>
    <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
  </svg>`

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
  createEvent(ModalEvents.Open, { param: url }).dispatch()
  // Save last focused element outside of modal to restore focus on modal close
  const previouslyFocusedOutsideModalElement =
    document.activeElement as HTMLElement
  closeButton.onclick = () => closeModal(classList)
  modalBackdrop.style.display = 'block' // shows modal

  modal.addEventListener('keydown', trapFocusListener)
  modal.addEventListener('keydown', escapePressListener)

  /**
   * Cleanup listeners and restore focus
   */
  function closeModal(classList?: string) {
    createEvent(ModalEvents.Close).dispatch()
    if (classList) modal.classList.remove(classList)
    modalBackdrop.style.display = 'none'
    modal.removeEventListener('keydown', trapFocusListener)
    modal.removeEventListener('keydown', escapePressListener)

    if (previouslyFocusedOutsideModalElement)
      previouslyFocusedOutsideModalElement?.focus()
  }

  function trapFocusListener(event: KeyboardEvent) {
    trapFocus(modal, event)
  }

  function escapePressListener(event: KeyboardEvent) {
    if (event.key === 'Escape') closeModal(classList)
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
