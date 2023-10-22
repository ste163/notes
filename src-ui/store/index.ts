/**
 * TODO:
 * revisit store state once
 * I'm setting up the remote server
 */
type StatusStoreKey =
  // | "remoteUrl"
  // | "isConnectedToRemote"
  | "lastSavedDate"
  // | "lastSyncedDate"
  | "error";

interface StatusStore {
  // remoteUrl: string;
  // isConnectedToRemote: boolean;
  lastSavedDate: null | Date;
  // lastSyncedDate: null | Date;
  error: string;
}

/**
 * Global store for status state.
 *
 * Example usage:
 * ```
 * import { StatusStore } from "../store";
 * StatusStore.remoteUrl = "http://localhost:5984";
 * ```
 * This will trigger all components that use the store to re-render state
 */
const StatusStore = new Proxy(
  {
    // remoteUrl: "",
    // isConnectedToRemote: false,
    lastSavedDate: null,
    // lastSyncedDate: null,
    error: "",
  },
  {
    set(target: StatusStore, key: StatusStoreKey, value) {
      if (key === "lastSavedDate") {
        value = new Date(value).toLocaleString();
      }

      (target[key] as any) = value;
      // trigger re-render of all components that use StatusStore
      return true;
    },
  }
);

export { StatusStore };
