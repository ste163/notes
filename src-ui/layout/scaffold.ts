/**
 * Render the base required HTML structure for the application.
 * This makes resetting the client state very easy as we never
 * rely on index.html for anything
 */
function renderScaffold() {
  const body = document.querySelector("body");

  if (!body) throw new Error("Body Element not found. Exit client scaffolding");

  body.innerHTML = `
    <div id="sidebar">
        <!-- Dynamically Generated -->
    </div>

    <main>
        <div id="editor-menu">
          <!-- Dynamically Generated -->
        </div>

        <div id="editor-floating-menu">
          <!-- Dynamically Generated -->
        </div>

        <div id="editor">
          <!-- Dynamically Generated -->
        </div>
    </main>
    `;

  const sidebarElement = document.querySelector("#sidebar");
  const editorMenuElement = document.querySelector("#editor-menu");
  const editorFloatingMenuElement = document.querySelector(
    "#editor-floating-menu"
  );
  const editorElement = document.querySelector("#editor");

  if (
    !sidebarElement ||
    !editorMenuElement ||
    !editorFloatingMenuElement ||
    !editorElement
  )
    throw new Error("Missing required HTML elements");

  return {
    sidebarElement,
    editorElement,
    editorMenuElement,
    editorFloatingMenuElement,
  };
}

export { renderScaffold };
