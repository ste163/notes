import { describe, it, vi, expect } from 'vitest'
import { logger } from 'logger'
import { useLocalStorage } from './use-local-storage'
import type { DatabaseDetails } from './use-local-storage'

vi.mock('logger')

describe('use-local-storage', () => {
  vi.mocked(logger.log).mockImplementation(vi.fn())
  const localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem')
  const localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem')

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

  it('set details returns undefined if details are not valid', () => {
    const details = { db: 'test' } as unknown as DatabaseDetails
    expect(useLocalStorage.set('remote-db-details', details)).toBeUndefined()
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
    expect(useLocalStorage.set('remote-db-details', details)).toBeUndefined()
    expect(localStorageSetSpy).toHaveBeenCalledWith(
      'remote-db-details',
      JSON.stringify(details)
    )
  })
})
