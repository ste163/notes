import './app-notification.css'

/**
 * Notification component (cannot use 'Notification' as it is a reserved word)
 */
class AppNotification {
  private id: string
  private innerHTML: string
  private element: HTMLDivElement | null = null

  constructor({ id, innerHTML }: { id: string; innerHTML: string }) {
    this.id = id
    this.innerHTML = innerHTML

    this.init()
  }

  private init() {
    const div = document.createElement('div')
    div.id = this.id
    div.classList.add('notification')
    div.innerHTML = this.innerHTML
    this.element = div
  }

  public show() {
    this.element && document.body.appendChild(this.element)
  }

  public remove() {
    this.element && document.body.removeChild(this.element)
  }
}

export { AppNotification }
