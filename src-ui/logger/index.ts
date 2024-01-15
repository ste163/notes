import { renderRemoteDbLogs } from 'renderer/reactive'
import { StatusStore } from 'store'

const logs: string[] = []

const logContainerId = '#remote-db-logs'

function logger(
  type: 'info' | 'error',
  message: string,
  error?: Error | unknown
) {
  const timestamp = new Date().toLocaleTimeString()

  // eg: "10:15:30 AM [info]: Connected to remote database."
  const processedMessage =
    timestamp +
    ` [${type}]` +
    ': ' +
    message +
    (error ? ' ' + 'Original Error: ' + JSON.stringify(error) : '')

  logs.push(processedMessage)
  if (type === 'info') {
    console.log('logger: ', processedMessage)
    StatusStore.error = ''
  } else {
    console.error('logger: ', processedMessage)
    StatusStore.error = processedMessage
  }

  // only keep 25 log entries, remove the first item if more than 30
  if (logs.length > 25) logs.shift()

  /**
   * Although the logger lives outside of the render functions,
   * by checking for the containers existence in the DOM while logging,
   * we can have real-time rendering
   */
  const container = document.querySelector(logContainerId)
  if (container) renderRemoteDbLogs(container)
}

export { logger, logs, logContainerId }
