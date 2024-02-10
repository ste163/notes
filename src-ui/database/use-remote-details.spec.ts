import { describe, it, vi, expect } from 'vitest'
import { useRemoteDetails } from './use-remote-details'
import * as exports from 'logger'
import type { RemoteDetails } from 'types'

describe('use-remote-details', () => {
  const loggerSpy = vi.spyOn(exports, 'logger').mockImplementation(vi.fn())
  const getSpy = vi.spyOn(Storage.prototype, 'getItem')
  const setSpy = vi.spyOn(Storage.prototype, 'setItem')

  it('get details returns default object if no details', () => {
    const { get } = useRemoteDetails()
    expect(get()).toEqual({
      username: '',
      password: '',
      host: '',
      port: '',
    })
  })

  it('get details returns default object if it is invalid', () => {
    getSpy.mockReturnValue(JSON.stringify({ db: 'test' }))
    const { get } = useRemoteDetails()
    expect(get()).toEqual({
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
    getSpy.mockReturnValue(JSON.stringify(details))
    const { get } = useRemoteDetails()
    expect(get()).toEqual(details)
  })

  it('set details returns undefined if details are not valid', () => {
    const { set } = useRemoteDetails()
    const details = { db: 'test' } as unknown as RemoteDetails
    expect(set(details)).toBeUndefined()
    expect(loggerSpy).toHaveBeenCalledOnce()
    expect(setSpy).not.toHaveBeenCalledWith(
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
    expect(setSpy).toHaveBeenCalledWith(
      'remote-db-details',
      JSON.stringify(details)
    )
  })
})
