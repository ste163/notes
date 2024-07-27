import { config } from 'config'
import { PARAMS } from 'const'

type UrlSearchParams = (typeof PARAMS)[keyof typeof PARAMS]

class UrlController {
  private url: URL
  private allowedParams: UrlSearchParams[] = ['sidebar', 'noteId', 'dialog']

  constructor() {
    this.url = new URL(
      config.BASE_URL === '/' ? window.location.origin : config.BASE_URL,
      window.location.origin
    )
  }

  public getParams() {
    const searchParams = new URLSearchParams(window.location.search)
    return {
      sidebar: searchParams.get(PARAMS.SIDEBAR) ?? '',
      noteId: searchParams.get(PARAMS.NOTE_ID) ?? '',
      dialog: searchParams.get(PARAMS.DIALOG) ?? '',
    }
  }

  public setParam(name: UrlSearchParams, value: string) {
    if (!this.allowedParams.includes(name))
      throw new Error(`Invalid param name: ${name}`)
    this.url = new URL(window.location.href)
    this.url.searchParams.set(name, value)
    window.history.pushState({}, '', this.url.href)
  }

  public removeParam(name: UrlSearchParams) {
    if (!this.allowedParams.includes(name))
      throw new Error(`Invalid param name: ${name}`)
    this.url = new URL(window.location.href)
    this.url.searchParams.delete(name)
    window.history.pushState({}, '', this.url.href)
  }
}

const urlController = new UrlController()

export { urlController }
