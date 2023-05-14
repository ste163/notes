import { createEditor } from "./editor";

// todo:
// look into DOM life cycles to see where the best one is for setting up the app
// ie, loading data, creating the editor, etc
window.addEventListener("DOMContentLoaded", () => {
  createEditor();
});
