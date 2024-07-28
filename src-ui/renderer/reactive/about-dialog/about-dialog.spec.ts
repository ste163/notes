import { describe, it, expect } from 'vitest'
import { render } from 'test-utils'
import { AboutDialog } from './about-dialog'
import userEvent from '@testing-library/user-event'

const AGPL = 'GNU AFFERO GENERAL PUBLIC LICENSE'
const APACHE = 'Version 2.0, January 2004'

describe('AboutDialog', () => {
  it('renders dialog and can toggle license visibility', async () => {
    const { instance, queryByText, getByRole } = render(AboutDialog)
    instance.render()

    // the licenses are not visible
    expect(queryByText(AGPL)).not.toBeInTheDocument()
    expect(queryByText(APACHE)).not.toBeInTheDocument()

    // can click the buttons and view the licenses
    await userEvent.click(
      getByRole('button', { name: 'View AGPL-3.0 License' })
    )
    await userEvent.click(
      getByRole('button', { name: 'View Apache 2.0 License' })
    )
    expect(getByRole('dialog').textContent).toContain(AGPL)
    expect(getByRole('dialog').textContent).toContain(APACHE)

    // clicking the buttons again hides the licenses
    await userEvent.click(
      getByRole('button', { name: 'View AGPL-3.0 License' })
    )
    await userEvent.click(
      getByRole('button', { name: 'View Apache 2.0 License' })
    )
    expect(getByRole('dialog').textContent).not.toContain(AGPL)
    expect(getByRole('dialog').textContent).not.toContain(APACHE)
  })
})
