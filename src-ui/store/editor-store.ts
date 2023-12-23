import type { Editor } from "@tiptap/core";

interface EditorStore {
  editor: null | Editor;
  isDirty: boolean;
}

type EditorStoreKey = "isDirty";

const EditorStore = new Proxy(
  {
    editor: null,
    isDirty: false,
  },
  {
    set(target: EditorStore, key: EditorStoreKey, value) {
      (target[key] as any) = value;
      return true;
    },
  }
);

export { EditorStore };
