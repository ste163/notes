import { vi, describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderComponent } from 'test-utils'
import { NoteEvents, createEvent, LifeCycleEvents } from 'event'
import { statusBar } from './status-bar'
import pkg from '../../../../package.json'

vi.mock('event')

const ONLINE_TEXT = 'Online'
const OFFLINE_TEXT = 'Offline'
const CONNECTING_TEXT = 'Attempting connection...'

// because status bar is managed by the main app,
// only testing individual render methods and their props
describe('status-bar', () => {
  it('renders disabled save button and settings button if no note selected', () => {
    const { getByRole } = renderComponent(statusBar.render)
    statusBar.renderActiveNote(null)

    expect(getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(getByRole('button', { name: 'Delete' })).toBeDisabled()
  })

  it('renders enabled save button and settings button and calls events on click', async () => {
    const { getByRole } = renderComponent(statusBar.render)
    statusBar.renderActiveNote({
      _id: 'abc',
      title: 'Note title',
      updatedAt: new Date(),
      createdAt: new Date(),
      content: '',
    })

    const saveButton = getByRole('button', { name: 'Save' })
    const deleteButton = getByRole('button', { name: 'Delete' })

    expect(saveButton).toBeEnabled()
    expect(deleteButton).toBeEnabled()

    await userEvent.click(saveButton)
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(NoteEvents.Save)

    await userEvent.click(deleteButton)
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(
      LifeCycleEvents.QueryParamUpdate,
      { dialog: 'delete' }
    )
  })

  it('renders package version number', () => {
    const { getByText } = renderComponent(statusBar.render)
    expect(getByText(`v${pkg.version}`)).toBeInTheDocument()
  })

  it('error alert does not render, if not present', () => {
    const { queryByRole } = renderComponent(statusBar.render)
    statusBar.renderAlert('')
    expect(queryByRole('button', { name: 'Error Error' })).toBeNull()
  })

  it('renders error alert button and emits dialog open', async () => {
    const { getByRole } = renderComponent(statusBar.render)
    statusBar.renderAlert('Error message')
    await userEvent.click(getByRole('button', { name: 'Error Error' }))
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(
      LifeCycleEvents.QueryParamUpdate,
      { dialog: 'database' }
    )
  })

  it('renders offline status and emits dialog open', async () => {
    const { getByText, queryByText } = renderComponent(statusBar.render)
    statusBar.renderRemoteDb({ isConnected: false })
    expect(queryByText(ONLINE_TEXT)).toBeNull()
    expect(queryByText(CONNECTING_TEXT)).toBeNull()
    await userEvent.click(getByText(OFFLINE_TEXT))
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(
      LifeCycleEvents.QueryParamUpdate,
      { dialog: 'database' }
    )
  })

  it('renders online status and emits dialog open', async () => {
    const { getByText, queryByText } = renderComponent(statusBar.render)
    statusBar.renderRemoteDb({ isConnected: true })
    expect(queryByText(OFFLINE_TEXT)).toBeNull()
    expect(queryByText(CONNECTING_TEXT)).toBeNull()
    expect(getByText(ONLINE_TEXT)).toBeInTheDocument()
    await userEvent.click(getByText(ONLINE_TEXT))
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(
      LifeCycleEvents.QueryParamUpdate,
      { dialog: 'database' }
    )
  })

  it('renders connecting state if connecting', () => {
    const { getByRole, getByText, queryByText } = renderComponent(
      statusBar.render
    )
    statusBar.renderRemoteDb({ isConnecting: true, isConnected: false })
    expect(queryByText(ONLINE_TEXT)).toBeNull()
    expect(queryByText(OFFLINE_TEXT)).toBeNull()
    expect(getByText(CONNECTING_TEXT)).toBeInTheDocument()
    expect(getByRole('status')).toBeInTheDocument()
  })

  it('does not render saved on date if null', () => {
    const { queryByText } = renderComponent(statusBar.render)
    statusBar.renderSavedOn(null)
    expect(queryByText('Saved on')).toBeNull()
  })

  it('renders saved on date if provided', () => {
    const { getByText } = renderComponent(statusBar.render)
    const date = new Date().toLocaleString()
    statusBar.renderSavedOn(date)
    expect(getByText(`Saved on: ${date}`)).toBeInTheDocument()
  })

  it('does not render synced on date if null', () => {
    const { queryByText } = renderComponent(statusBar.render)
    statusBar.renderSyncedOn(null)
    expect(queryByText('Synced on')).toBeNull()
  })

  it('renders synced on date', () => {
    const { getByText } = renderComponent(statusBar.render)
    const date = new Date().toLocaleString()
    statusBar.renderSyncedOn(date)
    expect(getByText(`Synced on: ${date}`)).toBeInTheDocument()
  })
})
