export const locators = {
  dialog: {
    close: '[testid="dialog-close"]',
    deleteDialog: {
      confirmButton: '[data-testid="delete-forever"]',
    },
    about: {
      agplButton: '[data-testid="view-agpl"]',
      agplContent: '[data-testid="agpl-license-block"]',
      apacheButton: '[data-testid="view-apache"]',
      apacheContent: '[data-testid="apache-license-block"]',
    },
  },
  editor: {
    content: '#editor',
    menu: {
      mainSection: '[data-testid="main-editor-button-section"]',
      ellipsisButton: '[data-testid="ellipsis-button"]',
      ellipsisSection: '[data-testid="ellipsis-editor-button-section"]',
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
    close: '[data-testid="close-sidebar"]',
    createNote: {
      button: '[data-testid="create-note"]',
      cancel: '[data-testid="create-note-cancel"]',
      input: '[data-testid="create-note-input"]',
      save: '[data-testid="create-note-save"]',
    },
    mainElement: '.sidebar-main',
    note: '[data-testid="note-select"]',
    resizeHandle: '[data-testid="sidebar-resize-handle"]',
  },
  statusBar: {
    about: '[data-testid="about"]',
    alert: '[data-testid="alert-error"]',
    database: '[data-testid="setup-database"]',
    delete: '[data-testid="delete-note"]',
    save: '[data-testid="save-note"]',
    savedOn: '[data-testid="status-bar-saved-on"]',
    sidebarToggle: '[data-testid="status-bar-sidebar-toggle"]',
    syncedOn: '[data-testid="status-bar-synced-on"]', // TODO: test when CouchDB is connected
  },
}
