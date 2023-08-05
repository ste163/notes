/**
 * Shared event emitters.
 * All others are scoped to the file they are used in.
 */

/**
 * Creates custom events with messages that can be dispatched when needed
 */
function createEvent(eventName: string, message: { [key: string]: any }) {
  const selectNoteEvent = new CustomEvent(eventName, {
    detail: message,
  });
  return { dispatch: () => dispatchEvent(selectNoteEvent) };
}

// TODO: this could be removed. How? Create an enum:
// EventName: { selectNote: "select-note" } etc.
// then we do not need functions like 'emitSelectedNote'
// then we could also add the type: SelectNoteMessage: { note: {title, path } }
function emitSelectedNote(title: string, path: string) {
  createEvent("select-note", { note: { title, path } }).dispatch();
}

export { createEvent, emitSelectedNote };
