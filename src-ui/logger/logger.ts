import { LoggerEvents, createEvent } from 'event'

type Type = 'info' | 'error'

class Logger {
  private logs: string[]

  constructor() {
    this.logs = []
  }

  public getLogs() {
    return [...this.logs]
  }

  public log(message: string, type: Type, error?: unknown) {
    if (type === 'info') this.logInfo(message)
    if (type === 'error') this.logError(message, error)
  }

  private format({
    message,
    type,
    error,
  }: {
    message: string
    type: Type
    error?: string
  }) {
    const timestamp = new Date().toLocaleTimeString()
    const formatted =
      timestamp +
      ` [${type}]` +
      ': ' +
      message +
      (error ? ' ' + 'Original Error: ' + JSON.stringify(error) : '')
    // eg: "10:15:30 AM [info]: Connected to remote database."
    return {
      type,
      log: formatted,
    }
  }

  private emitUpdate(log: string, type: Type) {
    createEvent(LoggerEvents.Update, { type, log })?.dispatch()
  }

  private addToLogs(log: string) {
    this.logs.push(log)
    // only keep 25 log entries, remove the first item if more than 30
    if (this.logs.length > 25) this.logs.shift()
  }

  private logInfo(message: string) {
    const { log, type } = this.format({ message, type: 'info' })
    console.log(log)
    this.addToLogs(log)
    this.emitUpdate(message, type)
  }

  private logError(message: string, error?: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error)
    const { log, type } = this.format({
      message,
      type: 'error',
      error: error ? errorMessage : '',
    })
    console.error(log)
    this.addToLogs(log)
    this.emitUpdate(message, type)
  }
}

const logger = new Logger()

export { logger }
