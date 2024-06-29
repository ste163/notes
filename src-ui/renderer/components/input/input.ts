import './input.css'

interface InputOptions {
  id: string
  label: string
  placeholder: string
  value?: string
}

class Input {
  private container: HTMLDivElement
  private input: HTMLInputElement
  private label: HTMLLabelElement

  constructor({ id, label, placeholder, value }: InputOptions) {
    this.container = document.createElement('div')
    this.container.classList.add('input-container')

    this.label = document.createElement('label')
    this.label.textContent = label
    this.label.htmlFor = id
    this.container.appendChild(this.label)

    this.input = document.createElement('input')
    this.input.id = id
    this.input.title = label
    this.input.placeholder = placeholder
    this.input.value = value ?? ''
    this.container.appendChild(this.input)
  }

  public getId(): string {
    return this.input.id
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

  public setValue(value: string) {
    this.input.value = value
  }

  public getValue(): string {
    return this.input.value
  }
}

export { Input }
