import { Window } from 'happy-dom'
import { within } from '@testing-library/dom'

/**
 * Render a component and its props
 * in a simulated window and document
 *
 * @param renderFunction component's render function
 * @param props component's props
 * @returns "within" instance from testing-library/dom for this component
 * that allows for destructuring the getByRole, queryByRole, etc.
 */
function renderComponent<T extends { [key: string]: unknown }>(
  containerId: string,
  renderFunction: (props: T) => void,
  props: T
) {
  const window = new Window()
  globalThis.window = window as Window & typeof globalThis.window
  globalThis.document = window.document as unknown as Document &
    typeof globalThis.document
  globalThis.window.document.body.innerHTML = `<div id="${containerId}"></div>`

  renderFunction(props)

  return within(window.document.body as unknown as HTMLElement)
}

export { renderComponent }
