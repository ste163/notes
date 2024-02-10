import { describe, it } from 'vitest'

describe('note-details-modal', () => {
  it.todo(
    'renders details modal with note state and can emit delete event'
    // TODO:
    // clicking the DELETE opens an input that requires you to type confirm
    // and only if that is inputted, can you click the confirm button (becomes enabled)
  )

  it.todo(
    'renders detail modal and updating title emits update event'
    // TODO:
    // rewrite modal to always have the input rendered with the title and allow updating it
    // the UPDATE button needs to be disabled if: note title is the same or empty
    // there will not be a cancel button, just the modal's close button
  )
})
