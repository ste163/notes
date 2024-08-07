export enum DatabaseEvents {
  Connecting = 'remote-connect',
  ConnectingError = 'remote-connecting-error',
  Connected = 'remote-connected',
  Init = 'init-database',
  Setup = 'remote-setup',
  SyncingPaused = 'remote-syncing-paused',
  Disconnect = 'remote-disconnect',
}

export enum KeyboardEvents {
  Keydown = 'keydown',
}

export enum LifeCycleEvents {
  Init = 'init',
  NoNoteSelected = 'no-note-selected',
  OpenedDialog = 'opened-dialog',
  QueryParamUpdate = 'query-param-update',
  ShowSaveNotification = 'show-save-notification',
  WidthChanged = 'width-changed',
}

export enum LoggerEvents {
  Update = 'update-logs',
}

export enum NoteEvents {
  Create = 'create-note',
  Delete = 'delete-note',
  GetAll = 'get-all-notes',
  Save = 'save-note',
  SaveCursorPosition = 'save-cursor-position',
  Select = 'select-note',
  UpdateTitle = 'update-note-title',
}
