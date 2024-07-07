/**
 * Goal here is to be a singleton
 * that ALWAYS has the lastest URL state
 * and can be used to update the URL
 * and get URL params
 */

import { config } from 'config'

type UrlSearchParams = 'noteId' | 'dialog'

class UrlController {
  private url: URL
  private allowedParams: UrlSearchParams[] = ['noteId', 'dialog']

  constructor() {
    this.url = new URL(
      config.BASE_URL === '/' ? window.location.origin : config.BASE_URL,
      window.location.origin
    )
  }

  public getAllParams() {
    const searchParams = new URLSearchParams(window.location.search)
    return {
      dialog: searchParams.get('dialog') ?? '',
      noteId: searchParams.get('noteId') ?? '',
    }
  }

  public setParam(name: UrlSearchParams, value: string) {
    if (!this.allowedParams.includes(name))
      throw new Error(`Invalid param name: ${name}`)
    this.url.searchParams.set(name, value)
  }

  public removeParam(name: UrlSearchParams) {
    if (!this.allowedParams.includes(name))
      throw new Error(`Invalid param name: ${name}`)
    this.url.searchParams.delete(name)
  }

  //   updateUrl() {
  //     window.history.pushState({}, '', this.url.href)
  //   }
}

const urlController = new UrlController()

export { urlController }
