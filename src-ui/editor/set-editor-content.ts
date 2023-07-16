import { Editor } from "@tiptap/core";
import { readNote } from "../api";

async function setEditorContent(editor: Editor, path: string) {
  const content = await readNote(path);
  editor.commands.setContent(content);
}

export { setEditorContent };
