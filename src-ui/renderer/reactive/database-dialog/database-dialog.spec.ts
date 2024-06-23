import { describe, it } from 'vitest'

describe('DatabaseDialog', () => {
  it.todo(
    'when offline, renders offline setup and ok if no errors'
    // status is offline
    // errors are okay
    // connection form only has CONNECT and no disconnect button
  )

  it.todo('when offline, render error if there is an error')

  it.todo(
    'when online, renders online setup and ok if no errors'
    // status is online
    // errors are okay
    // connection form has DISCONNECT, RECONNECT, CLEAR button
    // clicking DISCONNECT calls the disconnect event
    // clicking RECONNECT calls the reconnect event
    // clicking CLEAR removes the remote details + calls the disconnect event
  )

  it.todo('when online, renders error if there is an error')

  it.todo('setting the error state re-renders the status section')

  it.todo('setting the connection state re-renders the status section')

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
