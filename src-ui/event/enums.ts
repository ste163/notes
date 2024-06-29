// TODO: need a new name for LifeCycleEvents enum
export enum LifeCycleEvents {
  Init = 'init',
  WidthChanged = 'width-changed',
  SidebarOpened = 'sidebar-opened',
  SidebarClosed = 'sidebar-closed',
  SidebarOpenOrClose = 'sidebar-open-or-close',
  ShowSaveNotification = 'show-save-notification',
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
  OpenNoteDelete = 'open-note-delete-dialog',
  OpenDatabase = 'open-database-dialog',
}

export enum DatabaseEvents {
  Connecting = 'remote-connect',
  Connected = 'remote-connected',
  SyncingPaused = 'remote-syncing-paused',
  Disconnect = 'remote-disconnect',
}

export enum NoteEvents {
  GetAll = 'get-all-notes',
  Select = 'select-note',
  Create = 'create-note',
  Save = 'save-note',
  UpdateTitle = 'update-note-title',
  Delete = 'delete-note',
}
