import './input.css'

interface Input {
  title: string
  placeholder: string
  value?: string
}

function instantiateInput({
  title,
  placeholder,
  value,
}: Input): HTMLInputElement {
  const i = document.createElement('input')
  i.title = title
  i.placeholder = placeholder
  i.value = value ?? ''
  return i
}

export { instantiateInput }
