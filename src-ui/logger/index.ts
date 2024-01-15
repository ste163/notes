import { renderRemoteDbLogs } from 'renderer'

const logs: string[] = []

const logContainerId = '#remote-db-logs'

function logger(type: 'info' | 'error', message: string) {
  const timestamp = new Date().toLocaleTimeString()

  // eg: "10:15:30 AM [info]: Connected to remote database."
  const processedMessage = timestamp + ` [${type}]` + ': ' + message

  logs.push(processedMessage)
  console.log('logger: ', processedMessage)

  /**
   * Although the logger lives outside of the render functions,
   * by checking for the containers existence in the DOM while logging,
   * we can have real-time rendering
   */
  const container = document.querySelector(logContainerId)
  if (container) renderRemoteDbLogs(container)
}

export { logger, logs, logContainerId }
