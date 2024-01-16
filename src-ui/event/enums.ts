export enum KeyboardEvents {
  Keydown = 'keydown',
}

export enum ModalEvents {
  Open = 'open-modal',
  Close = 'close-modal',
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

export enum DatabaseEvents {
  RemoteConnected = 'remote-connected',
  RemoteSyncingSetup = 'remote-syncing-setup',
  RemoteDisconnected = 'remote-disconnected',
}
