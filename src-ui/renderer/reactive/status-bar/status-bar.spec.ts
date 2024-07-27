import { vi, describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render } from 'test-utils'
import { NoteEvents, createEvent, LifeCycleEvents } from 'event'
import { StatusBar } from './status-bar'
import pkg from '../../../../package.json'

vi.mock('event')

const ONLINE_TEXT = 'Online'
const OFFLINE_TEXT = 'Offline'
const CONNECTING_TEXT = 'Connecting...'

// because status bar is managed by the main app,
// only testing individual render methods and their props
describe('status-bar', () => {
  it('renders disabled save button and settings button if no note selected', () => {
    const { instance, getByRole } = render(StatusBar)
    instance.render()
    instance.renderActiveNote(null)

    expect(getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(getByRole('button', { name: 'Delete' })).toBeDisabled()
  })

  it('renders enabled save button and settings button and calls events on click', async () => {
    const { instance, getByRole } = render(StatusBar)
    instance.render()
    instance.renderActiveNote({
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
    const { instance, getByText } = render(StatusBar)
    instance.render()
    expect(getByText(`v${pkg.version}`)).toBeInTheDocument()
  })

  it('error alert renders properly', async () => {
    const { instance, queryByRole, getByRole } = render(StatusBar)
    instance.render()
    // does not render if false
    instance.renderErrorAlert(false)
    expect(queryByRole('button', { name: 'Error Error' })).toBeNull()
    // renders if true
    instance.renderErrorAlert(true)
    await userEvent.click(getByRole('button', { name: 'Error Error' }))
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(
      LifeCycleEvents.QueryParamUpdate,
      { dialog: 'database' }
    )
  })

  it('renders save alert', () => {
    const { instance, getByText, queryByText } = render(StatusBar)
    instance.render()
    instance.renderSaveAlert(true)
    expect(getByText('Saved')).toBeInTheDocument()

    // and removes it if false
    instance.renderSaveAlert(false)
    expect(queryByText('Saved')).toBeNull()
  })

  it('renders offline status and emits dialog open', async () => {
    const { instance, getByText, queryByText } = render(StatusBar)
    instance.render()
    instance.renderRemoteDb()
    expect(queryByText(ONLINE_TEXT)).toBeNull()
    expect(queryByText(CONNECTING_TEXT)).toBeNull()
    await userEvent.click(getByText(OFFLINE_TEXT))
    expect(vi.mocked(createEvent)).toHaveBeenCalledWith(
      LifeCycleEvents.QueryParamUpdate,
      { dialog: 'database' }
    )
  })

  it('renders online status and emits dialog open', async () => {
    const { instance, getByText, queryByText } = render(StatusBar)
    instance.render()
    instance.setIsConnected(true)
    instance.renderRemoteDb()
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
    const { instance, getByRole, getByText, queryByText } = render(StatusBar)
    instance.render()
    instance.setIsConnected(false)
    instance.setIsConnecting(true)
    instance.renderRemoteDb()
    expect(queryByText(ONLINE_TEXT)).toBeNull()
    expect(queryByText(OFFLINE_TEXT)).toBeNull()
    expect(getByText(CONNECTING_TEXT)).toBeInTheDocument()
    expect(getByRole('status')).toBeInTheDocument()
  })

  it('does not render saved on date if null', () => {
    const { instance, queryByText } = render(StatusBar)
    instance.render()
    instance.renderSavedOn(null)
    expect(queryByText('Saved on')).toBeNull()
  })

  it('renders saved on date if provided', () => {
    const { instance, getByText } = render(StatusBar)
    instance.render()
    const date = new Date().toLocaleString()
    instance.renderSavedOn(date)
    expect(getByText(`Saved on: ${date}`)).toBeInTheDocument()
  })

  it('does not render synced on date if null', () => {
    const { instance, queryByText } = render(StatusBar)
    instance.render()
    instance.renderSyncedOn(null)
    expect(queryByText('Synced on')).toBeNull()
  })

  it('renders synced on date', () => {
    const { instance, getByText } = render(StatusBar)
    instance.render()
    const date = new Date().toLocaleString()
    instance.renderSyncedOn(date)
    expect(getByText(`Synced on: ${date}`)).toBeInTheDocument()
  })
})
