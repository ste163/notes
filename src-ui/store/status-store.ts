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

      const footerContainer = document.querySelector('footer')
      if (footerContainer) renderFooter(footerContainer)

      // TODO: this doesn't work to re-open the modal on a state change
      // might be best to make this router/url based. Could be a param option:
      // ?db-modal=true
      const isModalRendered = document.querySelector('.remote-db-setup-modal')
      if (isModalRendered) renderRemoteDbSetupModal()

      return true
    },
  }
)

export { StatusStore }
