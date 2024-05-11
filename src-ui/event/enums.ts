// TODO: potentially get rid of LifeCycleEvents
export enum LifeCycleEvents {
  Init = 'init',
}

export enum KeyboardEvents {
  Keydown = 'keydown',
}

export enum LoggerEvents {
  Update = 'update-logs',
  Error = 'error-logged',
}

export enum DialogEvents {
  Opened = 'opened-dialog',
  Closed = 'closed-dialog',
}

export enum DatabaseEvents {
  RemoteConnect = 'remote-connect',
  RemoteConnected = 'remote-connected',
  RemoteSyncingPaused = 'remote-syncing-paused',
  RemoteDisconnect = 'remote-disconnect',
}

export enum NoteEvents {
  GetAll = 'get-all-notes',
  GotAll = 'got-all-notes',
  Select = 'select-note',
  Selected = 'note-selected',
  Create = 'create-note',
  Created = 'note-created',
  Save = 'save-note',
  Saved = 'note-saved',
  EditTitle = 'edit-note-title',
  Delete = 'delete-note',
}
