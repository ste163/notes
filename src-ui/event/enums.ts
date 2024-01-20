export enum LifeCycleEvents {
  Init = 'init',
  FetchAllNotes = 'fetch-all-notes',
  FetchedAllNotes = 'fetched-all-notes',
}

export enum KeyboardEvents {
  Keydown = 'keydown',
}

export enum LoggerEvents {
  Update = 'update-logs',
}

export enum ModalEvents {
  Open = 'open-modal',
  Close = 'close-modal',
}

export enum DatabaseEvents {
  RemoteConnect = 'remote-connect',
  RemoteConnected = 'remote-connected',
  RemoteSyncingPaused = 'remote-syncing-paused',
  RemoteDisconnect = 'remote-disconnect',
}

// TODO: implement:
// - created
// - saved
// - title-edited
// - deleted
// - selected
export enum NoteEvents {
  Create = 'create-note',
  Created = 'note-created',
  Save = 'save-note',
  Saved = 'note-saved',
  EditTitle = 'edit-note-title',
  TitleEdited = 'note-title-edited',
  Delete = 'delete-note',
  Deleted = 'note-deleted',
  Select = 'select-note',
  Selected = 'note-selected',
}
