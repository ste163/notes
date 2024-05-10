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

export { trapFocus }
