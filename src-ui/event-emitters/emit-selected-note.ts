function emitSelectedNote(title: string, path: string) {
  const selectNoteEvent = new CustomEvent("select-note", {
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
