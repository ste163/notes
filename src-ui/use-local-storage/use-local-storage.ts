import { logger } from 'logger'

type AllowedKeys = 'remote-db-details' | 'sidebar-width' | 'cursor-position'

interface CursorPosition {
  [key: string]: {
    from: number
    to: number
  }
}

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

class UseLocalStorage {
  private validators = {
    'cursor-position': this.validateCursorPosition,
    'remote-db-details': this.validateDetails,
    'sidebar-width': this.validateSidebarWidth,
  }

  private defaults: Record<AllowedKeys, unknown> = {
    'cursor-position': { from: 1, to: 1 },
    'remote-db-details': {
      username: '',
      password: '',
      host: '',
      port: '',
    },
    'sidebar-width': { width: 230 },
  }

  public get(key: AllowedKeys) {
    const details = window.localStorage.getItem(key)
    const parsed = details ? JSON.parse(details) : {}
    const isValid = this.validators[key](parsed)
    return isValid ? parsed : this.defaults[key]
  }

  public set(
    key: AllowedKeys,
    object: DatabaseDetails | SidebarWidth | CursorPosition
  ) {
    const isValid = this.validators[key](
      object as unknown as DatabaseDetails & SidebarWidth & CursorPosition
    )
    isValid
      ? window.localStorage.setItem(key, JSON.stringify(object))
      : logger.log(
          'error',
          `Invalid ${key}. Attempted to set local storage with: ` +
            JSON.stringify(object)
        )
  }

  private validateCursorPosition(cursorPosition: CursorPosition): boolean {
    return (
      cursorPosition &&
      typeof cursorPosition?.from === 'number' &&
      typeof cursorPosition?.to === 'number'
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
