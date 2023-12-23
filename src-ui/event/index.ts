/**
 * Creates custom events with messages that can be dispatched when needed
 */
function createEvent(eventName: string, message: { [key: string]: any }) {
  const event = new CustomEvent(eventName, {
    detail: message,
  });
  return { dispatch: () => dispatchEvent(event) };
}

export { createEvent };