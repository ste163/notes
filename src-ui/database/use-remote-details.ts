import { logger } from 'logger'
import type { RemoteDetails } from 'types'

/**
 * Runtime validation to ensure the local storage result is the valid structure
 */
function isRemoteDetails(detail: RemoteDetails): detail is RemoteDetails {
  return (
    detail &&
    typeof detail?.username === 'string' &&
    typeof detail?.password === 'string' &&
    typeof detail?.host === 'string' &&
    typeof detail?.port === 'string'
  )
}

function useRemoteDetails() {
  return {
    get: () => {
      const details = window.localStorage.getItem('remote-db-details')
      const parsed = details ? JSON.parse(details) : {}
      const isValidRemote = isRemoteDetails(parsed)
      return isValidRemote
        ? parsed
        : {
            username: '',
            password: '',
            host: '',
            port: '',
          }
    },
    set: (details: RemoteDetails) => {
      const isValidRemote = isRemoteDetails(details)
      if (!isValidRemote) {
        logger(
          'error',
          'Invalid remote details. Attempted to set with: ' +
            JSON.stringify(details)
        )
        return
      }
      window.localStorage.setItem('remote-db-details', JSON.stringify(details))
    },
  }
}

export { useRemoteDetails }
