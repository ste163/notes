import { vi, describe, it, expect } from 'vitest'
import { renderComponent } from 'test-utils'
import userEvent from '@testing-library/user-event'
import { databaseDialog } from './database-dialog'
import { DatabaseEvents, createEvent } from 'event'
import type { DatabaseDetails } from 'database'

vi.mock('event')

const OFFLINE_TEXT = 'Offline, saving to this device.'
const ONLINE_TEXT = 'Online, syncing to database.'
const NO_ERROR_TEXT = 'Good. No recent errors.'

const MOCK_DETAILS: DatabaseDetails = {
  username: 'user',
  password: 'password',
  host: 'host',
  port: 'port',
}

describe('DatabaseDialog', () => {
  // spying on local storage to ensure that the integration
  // of the useDatabaseDetails is working as expected
  const localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem')
  const localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem')

  it('when offline without saved remote details do not render them, renders offline setup and ok if no errors', () => {
    const { getByRole, queryByRole, getAllByRole, queryByText, getByText } =
      renderComponent(databaseDialog.render.bind(databaseDialog))

    databaseDialog.setIsConnected(false)
    databaseDialog.setError(null)

    expect(queryByText(ONLINE_TEXT)).toBeNull()
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

  it('when offline with saved database details and a recent error, render form and error', () => {
    localStorageGetSpy.mockReturnValue(JSON.stringify(MOCK_DETAILS))

    const { getByRole, queryByRole, getAllByRole, getByText } = renderComponent(
      databaseDialog.render.bind(databaseDialog)
    )

    databaseDialog.setIsConnected(false)
    databaseDialog.setError('Test error')

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
  })

  it('when online, renders online setup and no errors', async () => {
    localStorageGetSpy.mockReturnValue(JSON.stringify(MOCK_DETAILS))

    const { getByRole, queryByRole, getAllByRole, queryByText, getByText } =
      renderComponent(databaseDialog.render.bind(databaseDialog))

    databaseDialog.setIsConnected(true)
    databaseDialog.setError(null)

    // status section renders properly
    expect(getByText(ONLINE_TEXT)).toBeInTheDocument()
    expect(queryByText(OFFLINE_TEXT)).toBeNull()
    expect(getByText(NO_ERROR_TEXT)).toBeInTheDocument()

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
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(
      DatabaseEvents.RemoteConnect
    )

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
      DatabaseEvents.RemoteDisconnect
    )
    formInputs.forEach((input) => {
      expect(input).toHaveValue('')
    })

    // must manually update the connections status as that is controlled by events
    // to know if it was successful or not
    databaseDialog.setIsConnected(false)

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
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(
      DatabaseEvents.RemoteConnect
    )

    // TODO:
    // have the form and its buttons DISABLED
    // while the connection is being made (reconnect, disconnect, connect)
  })

  it('when online, renders error if there is an error', () => {
    const { getByText } = renderComponent(
      databaseDialog.render.bind(databaseDialog)
    )

    databaseDialog.setIsConnected(true)
    databaseDialog.setError('Test error')
    expect(getByText('Test error')).toBeInTheDocument()
  })

  it('setting the error state re-renders the status section', () => {
    const { getByText } = renderComponent(
      databaseDialog.render.bind(databaseDialog)
    )

    databaseDialog.setIsConnected(true)
    databaseDialog.setError('Test error')

    expect(getByText('Test error')).toBeInTheDocument()

    // state update that would be controlled by an event
    databaseDialog.setError(null)
    expect(getByText(NO_ERROR_TEXT)).toBeInTheDocument()
  })

  it('setting the connection state re-renders the status section', () => {
    const { getByText, queryByText } = renderComponent(
      databaseDialog.render.bind(databaseDialog)
    )

    databaseDialog.setError(null)
    databaseDialog.setIsConnected(false)

    expect(getByText(OFFLINE_TEXT)).toBeInTheDocument()
    expect(queryByText(ONLINE_TEXT)).toBeNull()

    // state update that would be controlled by an event
    databaseDialog.setIsConnected(true)
    expect(getByText(ONLINE_TEXT)).toBeInTheDocument()
    expect(queryByText(OFFLINE_TEXT)).toBeNull()
  })

  it.todo(
    'activity log can be opened and closed; when opened, shows latest logs when they occur'
    // open the logs, renders latest logger.getLogs
    // when another re-render occurs, the logs are still displayed on the DOM
    // (ie, testing that the logs do not disappear on a re-render because only USER decides to close it)
    // can close the log section
  )
})
