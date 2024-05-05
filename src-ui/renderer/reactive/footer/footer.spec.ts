import { describe, it, expect } from 'vitest'
// import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { footer } from './footer'
import pkg from '../../../../package.json'

// because footer is managed by the main app,
// only testing individual render methods and their props
describe('footer', () => {
  it('renders only package version on initial render', () => {
    const { getByText, queryByText } = renderComponent({
      renderComponent: footer.init,
    })
    expect(getByText(`v${pkg.version}`)).toBeInTheDocument()
    expect(queryByText('Connected')).toBeNull()
    expect(queryByText('Last saved')).toBeNull()
  })

  // add the error section after tests + refactoring are in-place
  it.todo('renders not connected db status and opens dialog on click')

  it.todo('renders connected db status and opens dialog on click')

  it.todo('does not render last saved date if null')

  it.todo('renders last saved date if provided')

  it.todo('does not render last sync date if null')

  it.todo('renders last sync date')
})
