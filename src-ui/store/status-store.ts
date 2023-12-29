/**
 * TODO:
 * revisit store once
 * I'm setting up the remote server
 */
interface StatusStore {
  // remoteUrl: string;
  // isConnectedToRemote: boolean;
  lastSavedDate: null | Date;
  // lastSyncedDate: null | Date;
  error: string;
}

const StatusStore = new Proxy(
  {
    // remoteUrl: "",
    // isConnectedToRemote: false,
    lastSavedDate: null,
    // lastSyncedDate: null,
    error: "",
  },
  {
    set(target: StatusStore, key: keyof StatusStore, value) {
      if (key === "lastSavedDate") value = new Date(value).toLocaleString();
      (target[key] as any) = value;
      return true;
    },
  }
);

export { StatusStore };
