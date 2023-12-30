import type { Notes } from "types";

interface NoteStore {
  notes: Notes;
  selectedNoteId: null | string;
}

const NoteStore = new Proxy(
  {
    notes: {},
    selectedNoteId: null,
  },
  {
    set(target: NoteStore, key: keyof NoteStore, value) {
      (target[key] as unknown) = value;
      return true;
    },
  }
);

export { NoteStore };
