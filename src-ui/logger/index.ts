import { renderRemoteDbLogs } from 'renderer/reactive'

const logs: string[] = []

const logContainerId = '#remote-db-logs'

// TODO: logger should probably include a error object?
function logger(type: 'info' | 'error', message: string) {
  const timestamp = new Date().toLocaleTimeString()

  // eg: "10:15:30 AM [info]: Connected to remote database."
  const processedMessage = timestamp + ` [${type}]` + ': ' + message

  logs.push(processedMessage)
  if (type === 'info') {
    console.log('logger: ', processedMessage)
  } else {
    console.error('logger: ', processedMessage)
  }

  /**
   * Although the logger lives outside of the render functions,
   * by checking for the containers existence in the DOM while logging,
   * we can have real-time rendering
   */
  const container = document.querySelector(logContainerId)
  if (container) renderRemoteDbLogs(container)
}

export { logger, logs, logContainerId }
