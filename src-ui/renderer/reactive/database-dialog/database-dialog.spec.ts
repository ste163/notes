import { describe, it } from 'vitest'

describe('DatabaseDialog', () => {
  it.todo(
    'when offline without saved remote details do not render them, renders offline setup and ok if no errors'
    // status is offline
    // errors are ''
    // connection form only has CONNECT and no disconnect button
    // NO values in inputs
  )

  it.todo(
    'when offline when details in the form, render error if there is an error'
    // also render the saved details
  )

  it.todo(
    'when online, renders online setup and ok if no errors'
    // status is online
    // errors are okay
    // connection form has RECONNECT and CLEAR buttons
    // clicking RECONNECT calls the reconnect event
    // clicking CLEAR removes the remote details + calls the disconnect event
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
    // on submit, calls the useRemoteDetails with the data
  )
})
