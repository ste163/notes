import { NoteStore } from "store";
import { createEvent } from "event";
import { renderButton, renderModal } from "components";

function renderNoteDetailsModal() {
  if (!NoteStore.selectedNoteId) throw new Error("No note selected");
  const { title, createdAt, updatedAt } =
    NoteStore.notes[NoteStore.selectedNoteId];
  const modalContent = document.createElement("div");

  // TODO
  // Have bold headings with the items beneath
  // (the Title will be editable)

  modalContent.innerHTML = `
    <h3>Title</h3>
    <div>${title}</div>
    
    <h3>Created at</h3>
    <div>${new Date(createdAt).toLocaleString()}</div>
     
    <h3>Last updated at</h3>
    <div>${new Date(updatedAt).toLocaleString()}</div>`;

  modalContent.appendChild(
    renderButton({
      title: "Delete note",
      html: `  
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>Delete note</title>
            <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM13.4142 13.9997L15.182 15.7675L13.7678 17.1817L12 15.4139L10.2322 17.1817L8.81802 15.7675L10.5858 13.9997L8.81802 12.232L10.2322 10.8178L12 12.5855L13.7678 10.8178L15.182 12.232L13.4142 13.9997ZM9 4V6H15V4H9Z"></path>
        </svg>
        <span>Delete forever</span>`,
      onClick: () => createEvent("delete-note").dispatch(),
    })
  );

  renderModal({
    title: "Details",
    content: modalContent,
  });
}

export { renderNoteDetailsModal };
