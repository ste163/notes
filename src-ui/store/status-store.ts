import { renderFooter } from 'renderer'

/**
 * The StatusStore is the only store
 * that re-renders its component, the footer,
 * outside of the main refreshClient render loop.
 */
interface StatusStore {
  lastSavedDate: null | Date
  lastSyncedDate: null | Date
  isConnectedToRemote: boolean
  error: string
}

const StatusStore = new Proxy(
  {
    lastSavedDate: null,
    lastSyncedDate: null,
    isConnectedToRemote: false,
    error: '',
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
