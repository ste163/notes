import './app-notification.css'

/**
 * Notification component (cannot use 'Notification' as it is a reserved word)
 */
class AppNotification {
  private id: string
  private text: string
  private icon: string
  private element: HTMLDivElement | null = null

  constructor({ id, text, icon }: { id: string; text: string; icon: string }) {
    this.id = id
    this.text = text
    this.icon = icon

    this.init()
  }

  private init() {
    const container = document.createElement('div')
    container.id = this.id
    container.classList.add('notification')

    const iconDiv = document.createElement('div')
    iconDiv.innerHTML = this.icon

    const span = document.createElement('span')
    span.innerText = this.text

    container.appendChild(iconDiv)
    container.appendChild(span)

    this.element = container
  }

  public show() {
    this.element && document.body.appendChild(this.element)
  }

  public remove() {
    this.element && document.body.removeChild(this.element)
  }
}

export { AppNotification }
