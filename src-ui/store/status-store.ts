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
      return true
    },
  }
)

export { StatusStore }
