/**
 * Creates custom events with messages that can be dispatched when needed
 */
function createEvent(eventName: string, message?: { [key: string]: unknown }) {
  const event = new CustomEvent(
    eventName,
    message && {
      detail: message,
    }
  );
  return { dispatch: () => dispatchEvent(event) };
}

export { createEvent };
