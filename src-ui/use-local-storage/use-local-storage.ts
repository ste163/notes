import { logger } from 'logger'

const Keys = {
  cursorPosition: 'cursor-position',
  remoteDbDetails: 'remote-db-details',
  sidebarWidth: 'sidebar-width',
} as const

type AllowedKeys = (typeof Keys)[keyof typeof Keys]

type CursorPosition = Record<
  string,
  {
    from: number
    to: number
  }
>

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
  constructor() {
    const ensureDefaultCursorExists = () => {
      const cursorPositions = JSON.parse(
        localStorage.getItem(Keys.cursorPosition) || '{}'
      )
      if (!cursorPositions.default) {
        cursorPositions.default = { from: 1, to: 1 }
        localStorage.setItem(
          Keys.cursorPosition,
          JSON.stringify(cursorPositions)
        )
      }
    }
    ensureDefaultCursorExists()
  }

  private validators = {
    [Keys.cursorPosition]: this.validateCursorPosition,
    [Keys.remoteDbDetails]: this.validateDetails,
    [Keys.sidebarWidth]: this.validateSidebarWidth,
  }

  private defaults: Record<AllowedKeys, unknown> = {
    [Keys.cursorPosition]: { default: { from: 1, to: 1 } },
    [Keys.remoteDbDetails]: {
      username: '',
      password: '',
      host: '',
      port: '',
    },
    [Keys.sidebarWidth]: { width: 230 },
  }

  public get(key: AllowedKeys) {
    const value = window.localStorage.getItem(key)
    const parsed = value ? JSON.parse(value) : {}
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
    if (isValid) window.localStorage.setItem(key, JSON.stringify(object))
    else
      logger.log(
        'error',
        `Invalid ${key}. Attempted to set local storage with: ` +
          JSON.stringify(object)
      )
  }

  private validateCursorPosition(cursorPosition: CursorPosition): boolean {
    return Object.values(cursorPosition).every(
      (position) =>
        position &&
        typeof position.from === 'number' &&
        typeof position.to === 'number'
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
