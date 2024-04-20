import { renderRemoteDbSetupDialog } from 'renderer/reactive'
import { createEvent, StatusStoreEvents } from 'event'

interface StatusStore {
  error: string
  lastSyncedDate: null | Date
  isConnectedToRemote: boolean
}

// TODO: fully remove this store
const StatusStore = new Proxy(
  {
    error: '',
    lastSyncedDate: null,
    isConnectedToRemote: false,
  },
  {
    set(target: StatusStore, key: keyof StatusStore, value) {
      if (key === 'lastSyncedDate')
        value = value ? new Date(value).toLocaleString() : null
      ;(target[key] as unknown) = value

      createEvent(StatusStoreEvents.Update)?.dispatch()

      // TODO (rendering is being completely revisited):
      // this doesn't work to re-open the modal on a state change
      // MAKE MODALS RENDER ON ROUTER STATE
      const isModalRendered = document.querySelector('.remote-db-setup-modal')
      if (isModalRendered) renderRemoteDbSetupDialog()

      return true
    },
  }
)

export { StatusStore }
