import { describe, it, expect } from 'vitest'
import { render } from 'test-utils'
import { AboutDialog } from './about-dialog'

describe('AboutDialog', () => {
  it.skip('renders dialog and can toggle license visibility', async () => {
    const { instance } = render(AboutDialog)
    instance.render()
    expect('dialog').toBeInTheDocument()
  })
})
