import { logger } from 'logger'

interface DatabaseDetails {
  [key: string]: string // needed for correct type indexing
  username: string
  password: string
  host: string
  port: string
}

const key = 'remote-db-details'

/**
 * Runtime validation to ensure the local storage result is the valid structure
 */
function validateDetails(detail: DatabaseDetails): detail is DatabaseDetails {
  return (
    detail &&
    typeof detail?.username === 'string' &&
    typeof detail?.password === 'string' &&
    typeof detail?.host === 'string' &&
    typeof detail?.port === 'string'
  )
}

function useDatabaseDetails() {
  return {
    get: () => {
      const details = window.localStorage.getItem(key)
      const parsed = details ? JSON.parse(details) : {}
      const isValidRemote = validateDetails(parsed)
      return isValidRemote
        ? parsed
        : {
            username: '',
            password: '',
            host: '',
            port: '',
          }
    },
    set: (details: DatabaseDetails) => {
      const isValidRemote = validateDetails(details)
      if (!isValidRemote) {
        logger.logError(
          'Invalid remote details. Attempted to set with: ' +
            JSON.stringify(details)
        )
        return
      }
      window.localStorage.setItem(key, JSON.stringify(details))
    },
  }
}

export { useDatabaseDetails }
export type { DatabaseDetails }
