import { renderFooter } from 'renderer'

/**
 * The StatusStore is the only store
 * that re-renders its component, the footer,
 * outside of the main refreshClient render loop.
 */
interface StatusStore {
  error: string
  lastSavedDate: null | Date
  lastSyncedDate: null | Date
  isConnectedToRemote: boolean
}

const StatusStore = new Proxy(
  {
    error: '',
    lastSavedDate: null,
    lastSyncedDate: null,
    isConnectedToRemote: false,
  },
  {
    set(target: StatusStore, key: keyof StatusStore, value) {
      if (key === 'lastSavedDate' || key === 'lastSyncedDate')
        value = new Date(value).toLocaleString()
      ;(target[key] as unknown) = value

      const container = document.querySelector('footer')
      if (container) renderFooter(container)

      return true
    },
  }
)

export { StatusStore }
