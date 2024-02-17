import { renderRemoteDbSetupModal } from 'renderer/reactive'
import { createEvent, StatusStoreEvents } from 'event'

interface StatusStore {
  error: string
  lastSavedDate: null | Date
  lastSyncedDate: null | Date
  isConnectedToRemote: boolean
}

// TODO: this may need to become:
// DbStatusStore
// or even better:
// move it just to the event and have the event handle
// the processing of data and rendering
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

      createEvent(StatusStoreEvents.Update)?.dispatch()

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
