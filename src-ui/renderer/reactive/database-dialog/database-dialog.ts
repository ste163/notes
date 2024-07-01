import { Button, Dialog, Input, Loader } from 'components'
import { logger } from 'logger'
import { DatabaseEvents, createEvent } from 'event'
import { useDatabaseDetails } from 'database'
import { databaseIcon, errorIcon, checkIcon } from 'icons'
import type { DatabaseDetails } from 'database'
import './database-dialog.css'

// TODO (final manual test for syncing after DB has been refactored):
// test that if I disconnect from one database
// and connect to a brand new one
// that all my data from my local is synced to the new remote.
//
// Also check that if I have a different DB on my local, disconnect
// then connect to a NEW db with different data, see what happens. Do they all merge together?
// once I figure out, need to document the results.
//
// Depending on results, allow for the Database class to swap
// its syncing mode: ie, user defines which approach they want

//
// TODO:
// need validation for inputs on the basic length requirements and values to exist
// to enable or disable the submit button.

//
// TODO:
// the one minute and 30 second countdown should be visible instead of just text, if possible
// however, may be too many re-renders unless it's handled in a special case

/**
 * DatabaseDialog contains the most state complexity in the application.
 * It needs to re-render its sub-components based on the live state
 * of the database connection (which contains user input that needs to
 * live between state updates).
 *
 * The dialog requires live information regardless of
 * whether it's open or closed.
 */
class DatabaseDialog {
  private dialog: Dialog | null = null
  private isConnectedToRemote = false
  private isConnectingToRemote = false
  private areLogsShown = false
  private syncedOn: string | null = null
  private error: string | null = null
  // managing the elements through properties,
  // so that we do not have to query the DOM
  // during the multiple state updates
  private formInputs: Input[] = []
  private formButtonContainer: HTMLDivElement | null = null
  private formSubmitButton: HTMLButtonElement | null = null
  private formClearButton: HTMLButtonElement | null = null

  public render() {
    this.reset()
    const dialogContent = document.createElement('div')

    dialogContent.innerHTML = `
      <section id='database-dialog-status'></section>
      <section id='database-dialog-connection-details'></section>
      <section id='database-dialog-help'>
        <h3>Need help?</h3>
        <p>
          If you would like to enable cloud-syncing, you may visit <a target="_blank" href="https://github.com/ste163/couchdb-docker">this related project on Github</a>.
        </p>
      </section>`

    this.dialog = new Dialog()
    this.dialog.setContent({
      title: 'Database',
      content: dialogContent,
      url: 'database',
      classList: 'database-dialog',
    })

    this.dialog.open()
    this.renderStatus()
    this.renderConnectionForm()
  }

  private reset() {
    if (this.dialog) this.dialog.close()
    this.areLogsShown = false
  }

  public setSyncedOn(date: string | null) {
    this.syncedOn = date
    this.updateSubComponents()
  }

  public setIsConnected(isConnected: boolean) {
    this.isConnectedToRemote = isConnected
    this.updateSubComponents()
  }

  public setIsConnecting(isConnecting: boolean) {
    this.isConnectingToRemote = isConnecting
    this.updateSubComponents()
  }

  public setError(error: string | null) {
    this.error = error
    this.updateSubComponents()
  }

  private updateSubComponents() {
    this.renderStatus()
    this.renderConnectionForm(false)
  }

  public renderStatus() {
    const container = document.querySelector('#database-dialog-status')
    if (!container) return

    const renderConnectionStatus = () =>
      this.isConnectingToRemote
        ? `
          <div class='database-dialog-status-loader'>  
            ${new Loader().getElement().outerHTML}
          </div>
          <div class='database-dialog-status-text-container'>
            <span>Attempting connection...</span>
            <span class='database-dialog-status-small-text'>(will attempt for up to one minute and 30 seconds.)</span>
          </div>`
        : this.isConnectedToRemote
          ? `
            <div class='database-dialog-status-icon'>  
              ${databaseIcon}
            </div>
            <div class='database-dialog-status-text-container'>
              <span>Online, syncing to database.</span>
              ${this.syncedOn ? `<span  class='database-dialog-status-small-text'>Last synced on: ${this.syncedOn}</span>` : ''}
            </div>`
          : `
            <div class='database-dialog-status-icon'>
              ${databaseIcon}
            </div>
            <span>Offline, saving to this device.</span>`

    const renderErrorStatus = () =>
      this.error
        ? `
          <div class='database-dialog-status-icon'>
            ${errorIcon}
          </div>  
          <span>${this.error}</span>`
        : `
          <div class='database-dialog-status-icon'>
            ${checkIcon}
          </div>
          <span>Good.</span>`

    const renderDatabaseLogs = (shouldShow: boolean) => {
      const container = document.querySelector(
        '#database-dialog-status-log-block-container'
      )
      if (!container) return
      container.innerHTML = ''
      if (!shouldShow) return

      const renderLogs = () => {
        const div = document.createElement('div')
        div.id = 'database-dialog-status-log-block'
        div.classList.add('code-block')

        // TODO: based on logs '[type]' assign color coding (errors are an accessible red)
        const logs = logger.getLogs().reverse() // show newest logs first
        if (logs.length)
          div.innerHTML = logs
            .map((log) => `<p>${log}</p>`)
            .reduce((acc, curr) => acc + curr)

        container.appendChild(div)
      }
      renderLogs()
    }

    // setup main status section structure
    container.innerHTML = `
      <h3>Status</h3>
      <div class='database-dialog-status-container'>${renderErrorStatus()}</div>
      <div class='database-dialog-status-container'>${renderConnectionStatus()}</div>
      <div id='database-dialog-status-log-container'>
        <div id='database-dialog-status-log-button'></div>
        <div id='database-dialog-status-log-block-container'></div>
      </div>`

    document.querySelector('#database-dialog-status-log-button')?.appendChild(
      new Button({
        title: 'Toggle recent activity logs (for developers)',
        html: 'Toggle recent activity logs (for developers)',
        onClick: () => {
          if (this.areLogsShown) {
            this.areLogsShown = false
            renderDatabaseLogs(this.areLogsShown)
          } else {
            this.areLogsShown = true
            renderDatabaseLogs(this.areLogsShown)
          }
        },
      }).getElement()
    )

    // if the logs are open during a re-render, keep them open
    renderDatabaseLogs(this.areLogsShown)
  }

  public renderConnectionForm(isInitialRender = true) {
    // TODO/NOTE: consider moving to a property of the class like the other containers
    const container = document.querySelector(
      '#database-dialog-connection-details'
    )
    if (!container) return // no need to throw error as it may not be rendered
    if (isInitialRender)
      container.innerHTML = `
      <h3>Connection details</h3>
      <form id='database-dialog-connection-form'></form>`
    const form = document.querySelector('#database-dialog-connection-form')

    const createSubmitButton = () => {
      const text = this.isConnectedToRemote ? 'Reconnect' : 'Connect'
      const button = new Button({
        id: 'database-dialog-submit-button',
        title: text,
        html: text,
        onClick: () => {
          const details = this.formInputs.reduce((acc, input) => {
            return {
              ...acc,
              [input.getId()]: input.getValue(),
            }
          }, {} as DatabaseDetails)
          useDatabaseDetails.set(details)
          createEvent(DatabaseEvents.Setup).dispatch()
        },
      })
      button.setEnabled(!this.isConnectingToRemote)
      return button.getElement()
    }

    const createClearButton = () => {
      const button = new Button({
        id: 'database-dialog-clear-button',
        title: 'Clear',
        html: 'Clear',
        onClick: () => {
          this.formInputs?.forEach((input) => {
            input.setValue('')
          })
          useDatabaseDetails.set({
            username: '',
            password: '',
            host: '',
            port: '',
          })
          createEvent(DatabaseEvents.Disconnect).dispatch()
        },
      })
      button.setEnabled(!this.isConnectingToRemote)
      return button.getElement()
    }

    const createInputs = () => {
      const savedDetails = useDatabaseDetails.get()
      return [
        {
          id: 'username',
          label: 'Username',
          placeholder: 'admin',
          value: savedDetails.username,
        },
        {
          id: 'password',
          label: 'Password',
          placeholder: 'password',
          value: savedDetails.password,
        },
        {
          id: 'host',
          label: 'Host',
          placeholder: '192.168.0.**',
          value: savedDetails.host,
        },
        {
          id: 'port',
          label: 'Port',
          placeholder: '5984',
          value: savedDetails.port,
        },
      ].map((config) => new Input(config))
    }

    if (isInitialRender) {
      this.formInputs = createInputs()
      this.formInputs.forEach((input) => {
        form?.appendChild(input.getContainer())
        input.setDisabled(this.isConnectingToRemote)
      })

      const disableDefaultSubmit = (event: Event) => {
        event?.preventDefault()
        event?.stopPropagation()
      }
      form?.addEventListener('submit', disableDefaultSubmit)

      const buttonContainer = document.createElement('div')
      buttonContainer.id = 'database-dialog-button-container'
      this.formButtonContainer = buttonContainer

      this.formSubmitButton = createSubmitButton()

      this.formButtonContainer.appendChild(this.formSubmitButton)

      if (this.isConnectedToRemote) {
        this.formClearButton = createClearButton()
        this.formButtonContainer?.appendChild(this.formClearButton)
      }

      form?.appendChild(buttonContainer)
      return
    }
    // all subsequent re-renders
    const updateSubmitButton = () => {
      this.formSubmitButton?.remove()
      this.formSubmitButton = createSubmitButton()
      this.formButtonContainer?.appendChild(this.formSubmitButton)
    }

    const updateClearButton = () => {
      this.formClearButton?.remove()
      if (this.isConnectedToRemote) {
        this.formClearButton = createClearButton()
        this.formButtonContainer?.appendChild(this.formClearButton)
      }
    }

    updateSubmitButton()
    updateClearButton()

    this.formInputs.forEach((input) => {
      input.setDisabled(this.isConnectingToRemote)
    })
  }
}

const databaseDialog = new DatabaseDialog()

export { databaseDialog }
