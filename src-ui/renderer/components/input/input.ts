import './input.css'

interface InputOptions {
  id: string
  testId?: string
  label: string
  placeholder: string
  value?: string
  isLabelHidden?: boolean
}

class Input {
  private container: HTMLDivElement
  private input: HTMLInputElement
  private label: HTMLLabelElement

  constructor({
    id,
    testId,
    label,
    placeholder,
    value,
    isLabelHidden = false,
  }: InputOptions) {
    this.container = document.createElement('div')
    this.container.classList.add('input-container')

    this.label = document.createElement('label')
    this.label.textContent = label
    this.label.htmlFor = id
    if (isLabelHidden) this.label.classList.add('label-hidden')
    this.container.appendChild(this.label)

    this.input = document.createElement('input')
    this.input.id = id
    if (testId) this.input.setAttribute('data-testid', testId)
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

  public setDisabled(disabled: boolean) {
    this.input.disabled = disabled
  }
}

export { Input }
