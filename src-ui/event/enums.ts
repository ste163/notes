// TODO: potentially get rid of LifeCycleEvents
export enum LifeCycleEvents {
  Init = 'init',
  WidthChanged = 'width-changed',
  SidebarOpened = 'sidebar-opened',
  SidebarClosed = 'sidebar-closed',
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
  OpenNoteDetails = 'open-note-details-dialog',
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
  Save = 'save-note',
  UpdateTitle = 'update-note-title',
  Delete = 'delete-note',
}
