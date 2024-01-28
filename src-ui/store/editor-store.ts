import type { Editor } from '@tiptap/core'

// TODO: revisit the editorStore.
// it may not be needed
interface EditorStore {
  editor: null | Editor
  isDirty: boolean
}

const EditorStore = new Proxy(
  {
    editor: null,
    isDirty: false,
  },
  {
    set(target: EditorStore, key: keyof EditorStore, value) {
      target[key] = value
      return true
    },
  }
)

export { EditorStore }
