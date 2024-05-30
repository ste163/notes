import { resolve } from 'path'
import { readFileSync } from 'fs'
import { Window } from 'happy-dom'
import { within } from '@testing-library/dom'

type Props = { [key: string]: unknown } | unknown

/**
 * Render a component and its props
 * in a simulated window and document
 *
 * @param containerId (optional) id of container to render in or the index html file if not given
 * @param renderComponent component's render function
 * @param props component's props
 * @returns "within" instance from testing-library/dom for this component
 * that allows for destructuring the getByRole, queryByRole, etc.
 */
function renderComponent<T extends Props>({
  renderComponent,
  props = {} as T,
}: {
  renderComponent: (props: T) => void
  props?: T
}) {
  const window = new Window()
  globalThis.window = window as Window & typeof globalThis.window
  globalThis.document = window.document as unknown as Document &
    typeof globalThis.document
  globalThis.window.document.body.innerHTML = getIndexBodyContent()

  renderComponent(props)

  return within(window.document.body as unknown as HTMLElement)
}

/**
 * Get the body content from the index.html file.
 * For example: everything inside of <body>...</body>
 *
 * @returns string
 */
function getIndexBodyContent() {
  const filePath = resolve(__dirname, '..', '..', 'index.html')
  const html = readFileSync(filePath, 'utf-8')
  const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || ''
  return bodyContent
}

export { renderComponent }
