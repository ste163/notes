import './input.css'

interface InputOptions {
  id: string
  title: string
  placeholder: string
  value?: string
}

class Input {
  private container: HTMLDivElement
  private input: HTMLInputElement
  private label: HTMLLabelElement

  constructor({ id, title, placeholder, value }: InputOptions) {
    this.container = document.createElement('div')
    this.container.classList.add('input-container')

    this.label = document.createElement('label')
    this.label.textContent = title
    this.label.htmlFor = id
    this.container.appendChild(this.label)

    this.input = document.createElement('input')
    this.input.id = id
    this.input.title = title
    this.input.placeholder = placeholder
    this.input.value = value ?? ''
    this.container.appendChild(this.input)
  }

  public getContainer(): HTMLDivElement {
    return this.container
  }

  public getInput(): HTMLInputElement {
    return this.input
  }

  public getLabel(): HTMLLabelElement {
    return this.label
  }
}

export { Input }
