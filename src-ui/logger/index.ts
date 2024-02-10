import { StatusStore } from 'store'
import { LoggerEvents, createEvent } from 'event'

const logs: string[] = []

// TODO: may not want this here as it tightly couples?
const logContainerId = '#remote-db-logs'

/**
 * Return the latest copy of logs const
 */
function getLogs() {
  return [...logs]
}

/**
 * Creates consistent logging and levels for the console
 * and the remote-db-logs component
 */
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
  }

  if (type === 'error') {
    console.error('logger: ', processedMessage)
    StatusStore.error = processedMessage
  }

  // only keep 25 log entries, remove the first item if more than 30
  if (logs.length > 25) logs.shift()

  createEvent(LoggerEvents.Update, { logs }).dispatch()
}

export { logger, getLogs, logContainerId }
