interface Note {
  _id: string
  _rev?: string // only exists on items in the db, may need 2 separate interfaces, a base and an extended one with _rev
  title: string
  content: string // all the JSON
  createdAt: Date // or string?
  updatedAt: Date // or string?
}

interface RemoteDetails {
  [key: string]: string // needed for correct type indexing
  username: string
  password: string
  host: string
  port: string
}

type Notes = Record<string, Note>

type MarkOptions = { level: number }

export type { Note, Notes, MarkOptions, RemoteDetails }
