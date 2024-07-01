import './loader.css'

class Loader {
  private element: HTMLDivElement

  constructor() {
    this.element = document.createElement('div')
    this.element.classList.add('loader')
    this.element.role = 'status'
    this.element.ariaLive = 'polite'
    this.element.innerHTML = `<span class='loader-accessibility-hidden-text'>Loading...</span>`
  }

  public getElement() {
    return this.element
  }
}

export { Loader }
