import { describe, it, vi, expect } from 'vitest'
import { logger } from 'logger'
import { useDatabaseDetails } from './use-database-details'
import type { DatabaseDetails } from './use-database-details'

vi.mock('logger')

describe('use-remote-details', () => {
  vi.mocked(logger.log).mockImplementation(vi.fn())
  const localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem')
  const localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem')

  it('get details returns default object if no details', () => {
    expect(useDatabaseDetails.get()).toEqual({
      username: '',
      password: '',
      host: '',
      port: '',
    })
  })

  it('get details returns default object if it is invalid', () => {
    localStorageGetSpy.mockReturnValue(JSON.stringify({ db: 'test' }))
    expect(useDatabaseDetails.get()).toEqual({
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
    expect(useDatabaseDetails.get()).toEqual(details)
  })

  it('set details returns undefined if details are not valid', () => {
    const details = { db: 'test' } as unknown as DatabaseDetails
    expect(useDatabaseDetails.set(details)).toBeUndefined()
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
    expect(useDatabaseDetails.set(details)).toBeUndefined()
    expect(localStorageSetSpy).toHaveBeenCalledWith(
      'remote-db-details',
      JSON.stringify(details)
    )
  })
})
