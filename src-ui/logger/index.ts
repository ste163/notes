import { StatusStore } from 'store'
import { LoggerEvents, createEvent } from 'event'

class Logger {
  private logs: string[]

  constructor() {
    this.logs = []
  }

  private format({
    message,
    type,
    error,
  }: {
    message: string
    type: 'info' | 'error'
    error?: string
  }) {
    const timestamp = new Date().toLocaleTimeString()
    // eg: "10:15:30 AM [info]: Connected to remote database."
    return (
      timestamp +
      ` [${type}]` +
      ': ' +
      message +
      (error ? ' ' + 'Original Error: ' + JSON.stringify(error) : '')
    )
  }

  private emitUpdate() {
    createEvent(LoggerEvents.Update, { logs: this.getLogs() })?.dispatch()
  }

  private setMostRecentStatusStoreError(log: string) {
    StatusStore.error = log
  }

  private addToLogs(log: string) {
    this.logs.push(log)
    // only keep 25 log entries, remove the first item if more than 30
    if (this.logs.length > 25) this.logs.shift()
    this.emitUpdate()
  }

  public getLogs() {
    return [...this.logs]
  }

  public logInfo(message: string) {
    const formattedLog = this.format({ message, type: 'info' })
    console.log(formattedLog)
    this.addToLogs(formattedLog)
    this.setMostRecentStatusStoreError('')
  }

  public logError(message: string, error?: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error)
    const formattedLog = this.format({
      message,
      type: 'error',
      error: error ? errorMessage : '',
    })
    console.error(formattedLog)
    this.addToLogs(formattedLog)
    this.setMostRecentStatusStoreError(formattedLog)
  }
}

const logger = new Logger()

export { logger }
