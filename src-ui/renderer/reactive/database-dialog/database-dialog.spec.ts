import { vi, describe, it, expect } from 'vitest'
import { render } from 'test-utils'
import userEvent from '@testing-library/user-event'
import { DatabaseDialog } from './database-dialog'
import { DatabaseEvents, createEvent } from 'event'
import { logger } from 'logger'
import type { DatabaseDetails } from 'use-local-storage'

vi.mock('event')

// spying on local storage to ensure that the integration works properly
const localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem')
const localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem')

const OFFLINE_TEXT = 'Offline, saving to this device.'
const ONLINE_TEXT = 'Online, syncing to database.'
const CONNECTING_TEXT = 'Connecting...'
const NO_ERROR_TEXT = 'Good.'

const MOCK_DETAILS: DatabaseDetails = {
  username: 'user',
  password: 'password',
  host: 'host',
  port: 'port',
}

describe('DatabaseDialog', () => {
  it('when offline without saved details, renders empty form; renders offline setup and ok if no errors', () => {
    const {
      instance,
      getByRole,
      queryByRole,
      getAllByRole,
      queryByText,
      getByText,
    } = render(DatabaseDialog)
    instance.render()
    instance.setIsConnecting(false)
    instance.setIsConnected(false)
    instance.setError(null)

    expect(queryByText(ONLINE_TEXT)).toBeNull()
    expect(queryByText(CONNECTING_TEXT)).toBeNull()
    expect(getByText(OFFLINE_TEXT)).toBeInTheDocument()
    expect(getByText(NO_ERROR_TEXT)).toBeInTheDocument()

    const formInputs = getAllByRole('textbox')
    expect(formInputs.length).toBe(4)

    formInputs.forEach((input) => {
      expect(input).toHaveValue('')
    })

    expect(getByRole('button', { name: 'Connect' })).toBeInTheDocument()
    expect(queryByRole('button', { name: 'Clear' })).toBeNull()
    expect(queryByRole('button', { name: 'Reconnect' })).toBeNull()
  })

  it('when offline with saved details and a recent error, render form and error', async () => {
    localStorageGetSpy.mockReturnValue(JSON.stringify(MOCK_DETAILS))

    const { instance, getByRole, queryByRole, getAllByRole, getByText } =
      render(DatabaseDialog)
    instance.render()
    instance.setIsConnecting(false)
    instance.setIsConnected(false)
    instance.setError('Test error')

    expect(getByText('Test error')).toBeInTheDocument()

    const formInputs = getAllByRole('textbox')
    formInputs.forEach((input) => {
      expect(input).toHaveValue(MOCK_DETAILS[input.id])
    })

    // Because we're still offline, only rendering connect and not the other buttons.
    // Setting of connection is handled by the index, not the dialog.
    expect(getByRole('button', { name: 'Connect' })).toBeInTheDocument()
    expect(queryByRole('button', { name: 'Clear' })).toBeNull()
    expect(queryByRole('button', { name: 'Reconnect' })).toBeNull()

    // clicking connect calls the connect event
    await userEvent.click(getByRole('button', { name: 'Connect' }))
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(DatabaseEvents.Setup)
  })

  it('when online, renders online setup and no errors', async () => {
    localStorageGetSpy.mockReturnValue(JSON.stringify(MOCK_DETAILS))

    const {
      instance,
      getByRole,
      queryByRole,
      getAllByRole,
      queryByText,
      getByText,
    } = render(DatabaseDialog)
    instance.render()
    instance.setIsConnecting(false)
    instance.setIsConnected(true)
    instance.setError(null)

    // status section renders properly
    expect(getByText(ONLINE_TEXT)).toBeInTheDocument()
    expect(queryByText(OFFLINE_TEXT)).toBeNull()
    expect(getByText(NO_ERROR_TEXT)).toBeInTheDocument()
    expect(queryByText(CONNECTING_TEXT)).toBeNull()

    // form inputs are filled with the details
    const formInputs = getAllByRole('textbox')
    formInputs.forEach((input) => {
      expect(input).toHaveValue(MOCK_DETAILS[input.id])
    })

    // buttons are correct
    expect(queryByRole('button', { name: 'Connect' })).toBeNull()
    expect(getByRole('button', { name: 'Reconnect' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Clear' })).toBeInTheDocument()

    // clicking reconnect calls the reconnect event
    await userEvent.click(getByRole('button', { name: 'Reconnect' }))
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(DatabaseEvents.Setup)

    // clearing removes from storage, calls disconnect event, and clears form
    await userEvent.click(getByRole('button', { name: 'Clear' }))
    expect(localStorageSetSpy).toHaveBeenCalledWith(
      'remote-db-details',
      JSON.stringify({
        username: '',
        password: '',
        host: '',
        port: '',
      })
    )
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(
      DatabaseEvents.Disconnect
    )
    formInputs.forEach((input) => {
      expect(input).toHaveValue('')
    })

    // must manually update the connections status as that is controlled by events
    // to know if it was successful or not
    instance.setIsConnected(false)

    // can fill form with new data and submit it
    for await (const input of formInputs)
      await userEvent.type(input, 'new-data')

    await userEvent.click(getByRole('button', { name: 'Connect' }))
    expect(localStorageSetSpy).toHaveBeenCalledWith(
      'remote-db-details',
      JSON.stringify({
        username: 'new-data',
        password: 'new-data',
        host: 'new-data',
        port: 'new-data',
      })
    )
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(DatabaseEvents.Setup)

    // TODO:
    // have the form and its buttons DISABLED
    // while the connection is being made (reconnect, disconnect, connect)
  })

  it('when online, renders error if there is an error', () => {
    const { instance, getByText } = render(DatabaseDialog)
    instance.render()
    instance.setIsConnecting(false)
    instance.setIsConnected(true)
    instance.setError('Test error')
    expect(getByText('Test error')).toBeInTheDocument()
  })

  it('when online, renders last synced on date if available', () => {
    const date = new Date().toLocaleString()

    const { instance, queryByText, getByText } = render(DatabaseDialog)
    instance.render()
    instance.setIsConnecting(false)
    instance.setIsConnected(true)
    instance.setError(null)
    instance.setSyncedOn(date)

    expect(getByText(`Last synced on: ${date}`)).toBeInTheDocument()

    // when offline, does not render
    instance.setIsConnected(false)
    expect(queryByText(`Last synced on: ${date}`)).toBeNull()
  })

  it('setting the error state re-renders the status section', () => {
    const { instance, getByText } = render(DatabaseDialog)
    instance.render()
    instance.setIsConnecting(false)
    instance.setIsConnected(true)
    instance.setError('Test error')

    expect(getByText('Test error')).toBeInTheDocument()

    // state update that would be controlled by an event
    instance.setError(null)
    expect(getByText(NO_ERROR_TEXT)).toBeInTheDocument()
  })

  it('setting the connection state re-renders the status section', () => {
    const { instance, getByText, queryByText } = render(DatabaseDialog)
    instance.render()

    instance.setIsConnecting(false)
    instance.setError(null)
    instance.setIsConnected(false)

    expect(getByText(OFFLINE_TEXT)).toBeInTheDocument()
    expect(queryByText(ONLINE_TEXT)).toBeNull()
    expect(queryByText(CONNECTING_TEXT)).toBeNull()

    // state update that would be controlled by an event
    instance.setIsConnected(true)
    expect(getByText(ONLINE_TEXT)).toBeInTheDocument()
    expect(queryByText(OFFLINE_TEXT)).toBeNull()
  })

  it('when attempting to connect, form is disabled and loading indicator is shown', () => {
    // when connection status is set to false, then the form is disabled
    // and the loading indicator and text is removed
    const { instance, getByRole, getAllByRole, getByText, queryByText } =
      render(DatabaseDialog)
    instance.render()
    instance.setIsConnecting(true)
    instance.setIsConnected(false)
    instance.setSyncedOn(null)
    instance.setError(null)

    expect(queryByText(OFFLINE_TEXT)).toBeNull()
    expect(queryByText(ONLINE_TEXT)).toBeNull()
    expect(getByText(CONNECTING_TEXT)).toBeInTheDocument()

    expect(getByRole('status')).toBeInTheDocument()

    // form inputs disabled
    const formInputs = getAllByRole('textbox')
    formInputs.forEach((input) => {
      expect(input).toBeDisabled()
    })

    // submit button disabled
    expect(getByRole('button', { name: 'Connect' })).toBeDisabled()
  })

  it('activity log can be opened and closed; when opened, shows latest logs', async () => {
    const MOCK_LOG = 'Note created.'

    const loggerSpy = vi.spyOn(logger, 'getLogs')
    loggerSpy.mockReturnValue([MOCK_LOG])

    const { instance, getByRole, getByText, queryByText } =
      render(DatabaseDialog)
    instance.render()
    instance.setIsConnecting(false)
    instance.setIsConnected(false)
    instance.setError(null)

    // logger section is not displayed
    expect(queryByText(MOCK_LOG)).toBeNull()

    const button = getByRole('button', {
      name: 'Toggle recent activity logs (for developers)',
    })
    await userEvent.click(button)

    expect(getByText(MOCK_LOG)).toBeInTheDocument()

    // can hide logs
    await userEvent.click(button)
    expect(queryByText(MOCK_LOG)).toBeNull()
  })
})
