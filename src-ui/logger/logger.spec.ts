import { describe, it, vi, expect } from 'vitest'
import { createEvent } from 'event'
import { logger } from '.'

vi.mock('event')

describe('logger', () => {
  it('logs info and emits update event with logs', () => {
    const logSpy = vi.spyOn(console, 'log')
    logger.logInfo('Connected to remote database.')
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logger.getLogs()[0]).toContain('Connected to remote database.')
    expect(vi.mocked(createEvent)).toHaveBeenCalled()
  })

  it('logs error and emits update event with logs', () => {
    const errorSpy = vi.spyOn(console, 'error')
    logger.logError(
      'Failed to connect to remote database.',
      new Error('test error')
    )
    expect(errorSpy).toHaveBeenCalledOnce()
    expect(logger.getLogs()[1]).toContain(
      'Failed to connect to remote database.'
    )
    expect(vi.mocked(createEvent)).toHaveBeenCalled()
  })

  it('keeps max of 25 logs', () => {
    for (let i = 0; i < 30; i++) {
      logger.logInfo(`Log ${i}`)
    }
    expect(logger.getLogs().length).toBe(25)
  })
})
