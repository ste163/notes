import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { footer } from './footer'
import pkg from '../../../../package.json'

// because footer is managed by the main app,
// only testing individual render methods and their props
describe('footer', () => {
  it('renders only package version on initial render', () => {
    const { getByText, queryByText } = renderComponent({
      renderComponent: footer.render,
    })
    expect(getByText(`v${pkg.version}`)).toBeInTheDocument()
    expect(queryByText('Connected')).toBeNull()
    expect(queryByText('Last saved')).toBeNull()
  })

  it('does not render error alert button if no error passed in', () => {
    const { queryByRole } = renderComponent({
      renderComponent: footer.render,
    })
    footer.renderAlert('')
    expect(queryByRole('button', { name: 'Error Error' })).toBeNull()
  })

  it('renders error alert button and opens dialog', async () => {
    const { getByRole } = renderComponent({
      renderComponent: footer.render,
    })
    footer.renderAlert('Error message')
    await userEvent.click(getByRole('button', { name: 'Error Error' }))
    expect(getByRole('dialog')).toBeInTheDocument()
  })

  it('renders not connected db status and opens dialog on click', async () => {
    const { getByText, queryByText, getByRole } = renderComponent({
      renderComponent: footer.render,
    })
    footer.renderRemoteDb({ isConnected: false })
    expect(queryByText('Connected')).toBeNull()
    expect(getByText('Not connected')).toBeInTheDocument()
    await userEvent.click(getByText('Not connected'))
    expect(getByRole('dialog')).toBeInTheDocument()
  })

  it('renders connected db status and opens dialog on click', async () => {
    const { getByText, queryByText, getByRole } = renderComponent({
      renderComponent: footer.render,
    })
    footer.renderRemoteDb({ isConnected: true })
    expect(queryByText('Not connected')).toBeNull()
    expect(getByText('Connected')).toBeInTheDocument()
    await userEvent.click(getByText('Connected'))
    expect(getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render last saved date if null', () => {
    const { queryByText } = renderComponent({
      renderComponent: footer.render,
    })
    footer.renderLastSaved(null)
    expect(queryByText('Last saved')).toBeNull()
  })

  it('renders last saved date if provided', () => {
    const { getByText } = renderComponent({
      renderComponent: footer.render,
    })
    const date = new Date().toLocaleString()
    footer.renderLastSaved(date)
    expect(getByText(`Last saved: ${date}`)).toBeInTheDocument()
  })

  it('does not render last sync date if null', () => {
    const { queryByText } = renderComponent({
      renderComponent: footer.render,
    })
    footer.renderLastSynced(null)
    expect(queryByText('Last synced')).toBeNull()
  })

  it('renders last sync date', () => {
    const { getByText } = renderComponent({
      renderComponent: footer.render,
    })
    const date = new Date().toLocaleString()
    footer.renderLastSynced(date)
    expect(getByText(`Last synced: ${date}`)).toBeInTheDocument()
  })
})
