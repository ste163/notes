import { describe, it, vi, expect, beforeEach } from 'vitest'
import { logger } from 'logger'
import { useLocalStorage } from './use-local-storage'
import type { DatabaseDetails, SidebarWidth } from './use-local-storage'

vi.mock('logger')

vi.mocked(logger.log).mockImplementation(vi.fn())
const localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem')
const localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem')

describe('use-local-storage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('get details returns default object if no details', () => {
    expect(useLocalStorage.get('remote-db-details')).toEqual({
      username: '',
      password: '',
      host: '',
      port: '',
    })
  })

  it('get details returns default object if it is invalid', () => {
    localStorageGetSpy.mockReturnValue(JSON.stringify({ db: 'test' }))
    expect(useLocalStorage.get('remote-db-details')).toEqual({
      username: '',
      password: '',
      host: '',
      port: '',
    })
  })

  it('get details returns details if valid', () => {
    const details = {
      username: 'user',
      password: 'pass',
      host: 'host',
      port: 'port',
    }
    localStorageGetSpy.mockReturnValue(JSON.stringify(details))
    expect(useLocalStorage.get('remote-db-details')).toEqual(details)
  })

  it('set details logs error details are not valid', () => {
    const details = { db: 'test' } as unknown as DatabaseDetails
    useLocalStorage.set('remote-db-details', details)
    expect(logger.log).toHaveBeenCalledOnce()
    expect(localStorageSetSpy).not.toHaveBeenCalledWith(
      'remote-db-details',
      JSON.stringify(details)
    )
  })

  it('sets details if they are valid', () => {
    const details = {
      username: 'user',
      password: 'pass',
      host: 'host',
      port: 'port',
    }
    useLocalStorage.set('remote-db-details', details)
    expect(localStorageSetSpy).toHaveBeenCalledWith(
      'remote-db-details',
      JSON.stringify(details)
    )
  })

  it('returns default sidebar width if none given', () => {
    expect(useLocalStorage.get('sidebar-width')).toEqual({ width: 230 })
  })

  it('does not retrieve sidebar width if invalid data is stored', () => {
    localStorageGetSpy.mockReturnValue(JSON.stringify({ width: '910' }))
    expect(useLocalStorage.get('sidebar-width')).toEqual({ width: 230 })
  })

  it('does not set sidebar width if invalid value', () => {
    useLocalStorage.set('sidebar-width', {
      width: '900',
    } as unknown as SidebarWidth)
    expect(logger.log).toHaveBeenCalledOnce()
    expect(localStorageSetSpy).not.toHaveBeenCalled()
  })

  it('sets the sidebar width if valid', () => {
    useLocalStorage.set('sidebar-width', { width: 300 })
    expect(localStorageSetSpy).toHaveBeenCalledWith(
      'sidebar-width',
      JSON.stringify({ width: 300 })
    )
  })

  it('returns valid sidebar width if stored', () => {
    localStorageGetSpy.mockReturnValue(JSON.stringify({ width: 200 }))
    expect(useLocalStorage.get('sidebar-width')).toEqual({ width: 200 })
  })
})
