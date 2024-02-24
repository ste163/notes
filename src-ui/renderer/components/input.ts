import './input.css'

interface Props {
  id: string
  title: string
  placeholder: string
  value?: string
}

function instantiateInput({ id, title, placeholder, value }: Props) {
  const container = document.createElement('div')
  container.classList.add('input-container')

  const label = document.createElement('label')
  label.textContent = title
  label.htmlFor = id
  container.appendChild(label)

  const input = document.createElement('input')
  input.id = id
  input.title = title
  input.placeholder = placeholder
  input.value = value ?? ''

  container.appendChild(label)
  container.appendChild(input)

  return {
    inputContainer: container,
    input,
    label,
  }
}

export { instantiateInput }
