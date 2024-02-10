import './button.css'

interface Button<T = unknown> {
  title: string // accessibility title for button
  onClick: (args: T) => void
  id?: string
  className?: string
  html?: string
  style?: Partial<CSSStyleDeclaration>
}

/**
 * Generic function for creating button elements
 */
const instantiateButton = (button: Button) => {
  const element = document.createElement('button')
  element.title = button.title
  element.onclick = button.onClick
  if (button.id) element.setAttribute('id', button.id)
  if (button.className) element.className = button.className
  if (button.html) element.innerHTML = button.html
  if (button.style) {
    for (const key in button.style) {
      if (button.style.hasOwnProperty(key)) {
        const style = button.style[key]
        if (style) element.style[key] = style
      }
    }
  }
  return element
}

export { instantiateButton }
export type { Button }
