import { logger } from 'logger'

// NOTE:
// this could very easily live inside the Database class instance.
// consider that approach during the DB refactor
//
// actually, because I know there is more data for local storage
// this could be a LocalStorage class or UseLocalStorage
// and then it passes in a "type" and content
// so that it can do the runtime validation
interface DatabaseDetails {
  [key: string]: string // needed for correct type indexing
  username: string
  password: string
  host: string
  port: string
}

class UseDatabaseDetails {
  private key = 'remote-db-details'

  public get() {
    const details = window.localStorage.getItem(this.key)
    const parsed = details ? JSON.parse(details) : {}
    const isValidRemote = this.validateDetails(parsed)
    return isValidRemote
      ? parsed
      : {
          username: '',
          password: '',
          host: '',
          port: '',
        }
  }

  public set(details: DatabaseDetails) {
    const isValidRemote = this.validateDetails(details)
    if (!isValidRemote) {
      logger.log(
        'Invalid remote details. Attempted to set with: ' +
          JSON.stringify(details),
        'error'
      )
      return
    }
    window.localStorage.setItem(this.key, JSON.stringify(details))
  }

  private validateDetails(detail: DatabaseDetails): detail is DatabaseDetails {
    return (
      detail &&
      typeof detail?.username === 'string' &&
      typeof detail?.password === 'string' &&
      typeof detail?.host === 'string' &&
      typeof detail?.port === 'string'
    )
  }
}

const useDatabaseDetails = new UseDatabaseDetails()

export { useDatabaseDetails }
export type { DatabaseDetails }
