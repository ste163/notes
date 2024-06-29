import { vi, describe, it, expect } from 'vitest'
import { renderComponent } from 'test-utils'
import { databaseDialog } from './database-dialog'
// import { DatabaseEvents, createEvent } from 'event'
import type { DatabaseDetails } from 'database'

const OFFLINE_TEXT = 'Offline, saving to this device.'
const ONLINE_TEXT = 'Online, syncing to database.'

describe('DatabaseDialog', () => {
  // spying on local storage to ensure that the integration
  // of the useDatabaseDetails is working as expected
  const localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem')
  // const localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem')

  it('when offline without saved remote details do not render them, renders offline setup and ok if no errors', () => {
    const { getByRole, queryByRole, getAllByRole, queryByText, getByText } =
      renderComponent(databaseDialog.render.bind(databaseDialog))

    expect(queryByText(ONLINE_TEXT)).toBeNull()
    expect(getByText(OFFLINE_TEXT)).toBeInTheDocument()

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
    const details: DatabaseDetails = {
      username: 'user',
      password: 'password',
      host: 'host',
      port: 'port',
    }
    localStorageGetSpy.mockReturnValue(JSON.stringify(details))

    const { getByRole, queryByRole, getAllByRole, getByText } = renderComponent(
      databaseDialog.render.bind(databaseDialog)
    )

    databaseDialog.setError('Test error')

    expect(getByText('Test error')).toBeInTheDocument()

    const formInputs = getAllByRole('textbox')
    formInputs.forEach((input) => {
      expect(input).toHaveValue(details[input.id])
    })

    // Because we're still offline, only rendering connect and not the other buttons.
    // Setting of connection is handled by the index, not the dialog.
    expect(getByRole('button', { name: 'Connect' })).toBeInTheDocument()
    expect(queryByRole('button', { name: 'Clear' })).toBeNull()
    expect(queryByRole('button', { name: 'Reconnect' })).toBeNull()
  })

  it.todo(
    'when online, renders online setup and ok if no errors'
    // status is online
    // errors are okay
    // connection form has RECONNECT and CLEAR buttons
    // clicking RECONNECT calls the reconnect event
    // clicking CLEAR removes the remote details + calls the disconnect event
    // (check the spy and rendering after CLEAR click)
  )

  it.todo('when online, renders error if there is an error')

  it.todo('setting the error state re-renders the status section')

  it.todo(
    'setting the connection state re-renders the status section'
    // open the dialog without a connection
    // check that the form is filled with its details
    // MODIFY THE DETAILS
    // set the connection state to online
    // check that the buttons updated
    // check that the form is the same
  )

  it.todo(
    'activity log can be opened and closed; when opened, shows latest logs when they occur'
    // open the logs, renders latest logger.getLogs
    // when another re-render occurrs, the logs are still displayed on the DOM
    // (ie, testing that the logs do not disappear on a re-render because only USER decides to close it)
    // can close the log section
  )

  it.todo(
    // note: this test can be moved to the ONLINE test
    'connection details form can be filled'
    // the connection button is disabled UNLESS all items are filled
    // on submit, localStorage spy has been called with correct data
  )

  it.todo(
    'when connecting, the connection button is disabled'
    // this will need to just render the state change
    // as this is controlled by events.
  )
})
