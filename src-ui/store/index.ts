/**
 * Global state stores
 *
 * Example usage:
 * ```
 * import { StatusStore } from "../store";
 * StatusStore.remoteUrl = "http://localhost:5984";
 * ```
 * This will trigger all components that use the store to re-render state
 * and allows for intercepting state changes to process them
 * (e.g. setting a date and formatting it for display)
 */
export { EditorStore } from './editor-store'
export { StatusStore } from './status-store'
