import { describe, it, vi, expect } from 'vitest'
import { useRemoteDetails } from './use-remote-details'
import { logger } from 'logger'
import type { RemoteDetails } from 'types'

vi.mock('logger')

describe('use-remote-details', () => {
  vi.mocked(logger.logError).mockImplementation(vi.fn())
  const localStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem')
  const localStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem')

  it('get details returns default object if no details', () => {
    expect(useRemoteDetails().get()).toEqual({
      username: '',
      password: '',
      host: '',
      port: '',
    })
  })

  it('get details returns default object if it is invalid', () => {
    localStorageGetSpy.mockReturnValue(JSON.stringify({ db: 'test' }))
    expect(useRemoteDetails().get()).toEqual({
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
    expect(useRemoteDetails().get()).toEqual(details)
  })

  it('set details returns undefined if details are not valid', () => {
    const { set } = useRemoteDetails()
    const details = { db: 'test' } as unknown as RemoteDetails
    expect(set(details)).toBeUndefined()
    expect(logger.logError).toHaveBeenCalledOnce()
    expect(localStorageSetSpy).not.toHaveBeenCalledWith(
      'remote-db-details',
      JSON.stringify(details)
    )
  })

  it('sets details if they are valid', () => {
    const { set } = useRemoteDetails()
    const details = {
      username: 'user',
      password: 'pass',
      host: 'host',
      port: 'port',
    }
    expect(set(details)).toBeUndefined()
    expect(localStorageSetSpy).toHaveBeenCalledWith(
      'remote-db-details',
      JSON.stringify(details)
    )
  })
})
