export enum Events {
  RemoteConnected = 'remote-connected',
  RemoteSyncingSetup = 'remote-syncing-setup',
  RemoteDisconnected = 'remote-disconnected',
  PutNote = 'put-note',
  DeleteNote = 'delete-note',
  GetAllNotes = 'get-all-notes', // get all note metadata?
  // TODO: get all by id (for getting note contents based on url param)
  GetById = 'get-note-by-id',
}
