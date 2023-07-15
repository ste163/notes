function renderGetStarted(editorContainer: Element): void {
  editorContainer.innerHTML = `
  <div>
    <h1>Get started</h1>
    <ul>
      <li>Create a note from the sidebar</li>
      <li>Your note title will be the file name</li>
      <li>Notes are saved as html files for easy portability</li>
    </ul>
  </div>
  `;
}

export { renderGetStarted };
