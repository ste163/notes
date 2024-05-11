import './button.css'
interface ButtonOptions<T = unknown> {
  title: string // accessibility title
  onClick: (args: T | MouseEvent) => void
  id?: string
  className?: string
  html?: string
  style?: Partial<CSSStyleDeclaration>
  disabled?: boolean
}

class Button<T = unknown> {
  private element: HTMLButtonElement

  constructor(options: ButtonOptions<T>) {
    this.element = document.createElement('button')
    this.element.title = options.title
    this.element.onclick = options.onClick
    if (options.id) this.element.setAttribute('id', options.id)
    if (options.className) this.element.className = options.className
    if (options.disabled) this.element.setAttribute('disabled', 'true')
    if (options.html) this.element.innerHTML = options.html
    if (options.style) {
      for (const key in options.style) {
        if (options.style.hasOwnProperty(key)) {
          const style = options.style[key]
          if (style) this.element.style[key] = style
        }
      }
    }
  }

  public getElement(): HTMLButtonElement {
    return this.element
  }
}

export { Button }
export type { ButtonOptions }
