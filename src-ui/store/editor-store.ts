import type { Editor } from '@tiptap/core'

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
      ;(target[key] as unknown) = value
      return true
    },
  }
)

export { EditorStore }
