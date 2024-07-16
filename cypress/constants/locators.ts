export const locators = {
  dialog: {
    close: '[testid="dialog-close"]',
    deleteDialog: {
      confirmButton: '[data-testid="delete-forever"]',
    },
  },
  editor: {
    content: '#editor',
    menu: {
      mainSection: '[data-testid="main-editor-button-section"]',
      ellipsisSection: '[data-testid="ellipsis-editor-button-section"]',
      ellipsisButton: '[data-testid="ellipsis-button"]',
    },
  },
  editTitle: {
    button: '[data-testid="edit-title-button"]',
    input: '[data-testid="edit-title-input"]',
  },
  notification: {
    save: '[data-testid="save-notification"]',
  },
  sidebar: {
    mainElement: '.sidebar-main',
    resizeHandle: '[data-testid="sidebar-resize-handle"]',
    close: '[data-testid="close-sidebar"]',
    createNote: {
      button: '[data-testid="create-note"]',
      input: '[data-testid="create-note-input"]',
      save: '[data-testid="create-note-save"]',
      cancel: '[data-testid="create-note-cancel"]',
    },
    note: '[data-testid="note-select"]',
  },
  statusBar: {
    database: '[data-testid="setup-database"]',
    delete: '[data-testid="delete-note"]',
    save: '[data-testid="save-note"]',
    sidebarToggle: '[data-testid="status-bar-sidebar-toggle"]',
    savedOn: '[data-testid="status-bar-saved-on"]',
    syncedOn: '[data-testid="status-bar-synced-on"]', // TODO: test when CouchDB is connected
  },
}
