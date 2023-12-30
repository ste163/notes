/**
 * Global state stores.
 *
 * Example usage:
 * ```
 * import { StatusStore } from "../store";
 * StatusStore.remoteUrl = "http://localhost:5984";
 * ```
 * This will trigger all components that use the store to re-render state
 */
export { NoteStore } from './note-store'
export { EditorStore } from './editor-store'
export { StatusStore } from './status-store'
