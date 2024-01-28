import { renderFooter, renderRemoteDbSetupModal } from 'renderer/reactive'

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

// TODO: this may need to become:
// DbStatusStore
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
        value = value ? new Date(value).toLocaleString() : null
      ;(target[key] as unknown) = value

      // TODO: statusStore will emit an event, status-store-updated
      // to decouple rendering from the store
      renderFooter()

      // TODO (rendering is being completely revisited):
      // this doesn't work to re-open the modal on a state change
      // MAKE MODALS RENDER ON ROUTER STATE
      const isModalRendered = document.querySelector('.remote-db-setup-modal')
      if (isModalRendered) renderRemoteDbSetupModal()

      return true
    },
  }
)

export { StatusStore }
