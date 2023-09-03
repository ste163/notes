import { Status } from "../types";

/**
 * Renders footer with latest status state
 */
function renderFooter(footerContainer: Element, status: Status): void {
  // could pass in a status object to render
  console.log("STATUS IN FOOTER", status);
  // need to render a gear icon for changing the remote server

  footerContainer.innerHTML =
    "status bar: (connected to remote server name + status + gear icon for changing remote, last saved timestamp)";
}

export { renderFooter };
