import { resolve } from 'path'
import { readFileSync } from 'fs'
import { Window } from 'happy-dom'
import { within } from '@testing-library/dom'

/**
 * Render a class component in the simulated window
 *
 * @param Class
 * @returns "within" instance from testing-library/dom of the body
 * This allows for tests to deconstruct selectors from this renderer.
 */
function render<T>(Class: new () => T) {
  setupWindowEnvironment()
  return {
    instance: new Class(),
    ...within(window.document.body as unknown as HTMLElement),
  }
}

/**
 * To render components for testing,
 * we need to simulate the window and document
 */
function setupWindowEnvironment() {
  const window = new Window()
  globalThis.window = window as Window & typeof globalThis.window
  globalThis.document = window.document as unknown as Document &
    typeof globalThis.document
  globalThis.window.document.body.innerHTML = getIndexBodyContent()
}

/**
 * Get the body content from the index.html file.
 * (Everything inside of <body>...</body>) as this most accurately
 * represents the actual app.
 *
 * @returns string
 */
function getIndexBodyContent() {
  const filePath = resolve(__dirname, '..', '..', 'index.html')
  const html = readFileSync(filePath, 'utf-8')
  const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || ''
  return bodyContent
}

export { render }
