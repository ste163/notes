import { logger } from 'logger'

interface DatabaseDetails {
  [key: string]: string // needed for correct type indexing
  username: string
  password: string
  host: string
  port: string
}

type AllowedKeys = 'remote-db-details'

type ValidatorFunction<T = DatabaseDetails> = (arg: T) => boolean

class UseLocalStorage {
  private validators: Record<AllowedKeys, ValidatorFunction> = {
    'remote-db-details': this.validateDetails,
  }

  private defaults: Record<AllowedKeys, unknown> = {
    'remote-db-details': {
      username: '',
      password: '',
      host: '',
      port: '',
    },
  }

  public get(key: AllowedKeys) {
    const details = window.localStorage.getItem(key)
    const parsed = details ? JSON.parse(details) : {}
    const isValid = this.validators[key](parsed)
    return isValid ? parsed : this.defaults[key]
  }

  public set(key: AllowedKeys, object: DatabaseDetails) {
    const isValid = this.validators[key](object)
    if (!isValid) {
      logger.log(
        `Invalid ${key}. Attempted to set local storage with: ` +
          JSON.stringify(object),
        'error'
      )
      return
    }
    window.localStorage.setItem(key, JSON.stringify(object))
  }

  private validateDetails(detail: DatabaseDetails): boolean {
    return (
      detail &&
      typeof detail?.username === 'string' &&
      typeof detail?.password === 'string' &&
      typeof detail?.host === 'string' &&
      typeof detail?.port === 'string'
    )
  }
}

const useLocalStorage = new UseLocalStorage()

export { useLocalStorage }
export type { DatabaseDetails }
