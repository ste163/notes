import type { Notes } from 'types'

interface NoteStore {
  notes: Notes
  selectedNoteId: null | string
}

// TODO: get rid of this proxy and only use the events
// that way state is always up-to-date and the path
// to debugging in a straight line
const NoteStore = new Proxy(
  {
    notes: {},
    selectedNoteId: null,
  },
  {
    set(target: NoteStore, key: keyof NoteStore, value) {
      target[key] = value

      // this is the nicest part of the store
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
