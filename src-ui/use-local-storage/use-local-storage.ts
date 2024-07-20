import { logger } from 'logger'

interface DatabaseDetails {
  [key: string]: string // needed for correct type indexing
  username: string
  password: string
  host: string
  port: string
}

interface SidebarWidth {
  width: number
}

type AllowedKeys = 'remote-db-details' | 'sidebar-width'

class UseLocalStorage {
  private validators = {
    'remote-db-details': this.validateDetails,
    'sidebar-width': this.validateSidebarWidth,
  }

  private defaults: Record<AllowedKeys, unknown> = {
    'remote-db-details': {
      username: '',
      password: '',
      host: '',
      port: '',
    },
    'sidebar-width': { width: 170 },
  }

  public get(key: AllowedKeys) {
    const details = window.localStorage.getItem(key)
    const parsed = details ? JSON.parse(details) : {}
    const isValid = this.validators[key](parsed)
    return isValid ? parsed : this.defaults[key]
  }

  public set(key: AllowedKeys, object: DatabaseDetails | SidebarWidth) {
    const isValid = this.validators[key](
      object as unknown as DatabaseDetails & SidebarWidth
    )
    isValid
      ? window.localStorage.setItem(key, JSON.stringify(object))
      : logger.log(
          `Invalid ${key}. Attempted to set local storage with: ` +
            JSON.stringify(object),
          'error'
        )
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

  private validateSidebarWidth(sidebarWidth: SidebarWidth): boolean {
    return typeof sidebarWidth?.width === 'number'
  }
}

const useLocalStorage = new UseLocalStorage()

export { useLocalStorage }
export type { DatabaseDetails, SidebarWidth }
