import type { Notes } from 'types'

interface NoteStore {
  notes: Notes
  selectedNoteId: null | string
}

const NoteStore = new Proxy(
  {
    notes: {},
    selectedNoteId: null,
  },
  {
    set(target: NoteStore, key: keyof NoteStore, value) {
      target[key] = value

      if (key === 'selectedNoteId') {
        const url = value ? `/${value}` : '/'
        window.history.pushState({}, '', url)
        // TODO: emit the event for NoteSelected
      }

      return true
    },
  }
)

export { NoteStore }
