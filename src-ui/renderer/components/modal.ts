/**
 * Renders a modal with the given title and content.
 * Handles open and close events along with trapping focus inside the modal
 */
function renderModal({
  title,
  content,
}: {
  title: string;
  content: HTMLElement;
}) {
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modal = document.getElementById("modal");
  const modalCloseButton = document.getElementById(
    "modal-close"
  ) as HTMLButtonElement;
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");

  if (
    !modalBackdrop ||
    !modal ||
    !modalCloseButton ||
    !modalTitle ||
    !modalContent
  )
    throw new Error("modal missing required element");

  modalTitle.innerText = title;
  modalContent.appendChild(content);

  openModal(modalBackdrop, modal, modalCloseButton);
}

/**
 * Opens modal, sets focus inside it and adds listeners
 */
function openModal(
  modalBackdrop: HTMLElement,
  modal: HTMLElement,
  closeButton: HTMLButtonElement
) {
  // Save last focused element outside of modal to restore focus on modal close
  const previouslyFocusedOutsideModalElement =
    document.activeElement as HTMLElement;

  closeButton.onclick = closeModal;
  modalBackdrop.style.display = "block"; // shows modal

  closeButton.focus(); // set focus on close button

  modal.addEventListener("keydown", trapFocusListener);
  modal.addEventListener("keydown", escapePressListener);

  /**
   * Cleanup listeners and restore focus
   */
  function closeModal() {
    modalBackdrop.style.display = "none";
    modal.removeEventListener("keydown", trapFocusListener);
    modal.removeEventListener("keydown", escapePressListener);

    if (previouslyFocusedOutsideModalElement)
      previouslyFocusedOutsideModalElement?.focus();
  }

  function trapFocusListener(event: KeyboardEvent) {
    trapFocus(modal, event);
  }

  function escapePressListener(event: KeyboardEvent) {
    if (event.key === "Escape") closeModal();
  }
}

/**
 * Traps keyboard focus inside the container element
 */
function trapFocus(container: HTMLElement, event: KeyboardEvent) {
  // Get the first and last focusable elements inside the container
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement;

  if (event.shiftKey && document.activeElement === firstFocusable) {
    event.preventDefault();
    lastFocusable.focus();
  }
  if (event.key === "Tab" && document.activeElement === lastFocusable) {
    event.preventDefault();
    firstFocusable.focus();
  }
}

export { renderModal };
