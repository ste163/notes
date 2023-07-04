function emitSelectedNote(title: string, path: string) {
  const selectNoteEvent = new CustomEvent("note-selected", {
    detail: {
      note: {
        title,
        path,
      },
    },
  });
  dispatchEvent(selectNoteEvent);
}

export { emitSelectedNote };
