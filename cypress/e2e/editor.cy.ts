// import { locators, DEFAULT_WAIT } from '../constants'
import { clearIndexDb } from '../utils'

describe('editor', () => {
  beforeEach(async () => {
    await clearIndexDb()
    // by default, cypress always clears localStorage between test runs
  })

  // TODO
  // SIZING
  // - OPENING the dialog on a smaller size where the ellipsis menu is open
  //   does not re-render the editor menu. Ie: all the same buttons are render, nothing changed
  //   - including on dialog close

  it.skip('editor menu buttons move to the ellipsis menu properly on different sizes', () => {
    // at 1000px all buttons are visible AND the ellipsis menu is hidden
    // ... etc for all the different amounts
    // clicking the ellipsis menu opens the menu
    // - clicking an item inside it closes it
    // - clicking outside it closes it
  })
})
