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

  constructor({
    title,
    onClick,
    id,
    className,
    html,
    style,
    disabled,
  }: ButtonOptions<T>) {
    this.element = document.createElement('button')
    this.element.title = title
    this.element.onclick = onClick
    if (id) this.element.setAttribute('id', id)
    if (className) this.element.className = className
    if (disabled) this.element.setAttribute('disabled', 'true')
    if (html) this.element.innerHTML = html
    if (style) {
      for (const key in style) {
        if (style.hasOwnProperty(key)) {
          const newStyle = style[key]
          if (newStyle) this.element.style[key] = newStyle
        }
      }
    }
  }

  public getElement() {
    return this.element
  }

  public setEnabled(enabled: boolean): void {
    this.element.disabled = !enabled
  }
}

export { Button }
export type { ButtonOptions }
