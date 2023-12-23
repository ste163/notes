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
      (target[key] as any) = value;
      return true;
    },
  }
);

export { NoteStore };
