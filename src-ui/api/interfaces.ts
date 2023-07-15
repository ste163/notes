import { FileEntry } from "@tauri-apps/api/fs";

// todo: extend with content, etc. for what the event emitters use
// for better type support
interface Note extends FileEntry {}

export { Note };
