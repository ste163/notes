import { Status } from "../types";

// TODO:
// create the footer using the proxy idea.
// which can be set at the app level.
// and if the proxy works, then convert the app to it as it seems much cleaner
// for passing props

/**
 * Renders footer with latest status state
 */
function renderFooter(footerContainer: Element, status: Status): void {
  // could pass in a status object to render
  console.log("STATUS IN FOOTER", status);
  const { isConnected, lastSaved } = status;
  // need to render a gear icon for changing the remote server

  footerContainer.innerHTML = `
  ${isConnected ? databaseIcon : "not connected"}
  `;
}

// COUPLE NOTES:
// will need to handle disconnect events and re-connect events

// break out into the different sections and render each piece dynamically:
// 1. the isConnected status: db icon, then the server url OR a button to connect that renders a modal
// 2. the another section on the far right that is the last saved time stamp that has a loading spinner icon

const databaseIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <title>Database</title>
  <path d="M5 12.5C5 12.8134 5.46101 13.3584 6.53047 13.8931C7.91405 14.5849 9.87677 15 12 15C14.1232 15 16.0859 14.5849 17.4695 13.8931C18.539 13.3584 19 12.8134 19 12.5V10.3287C17.35 11.3482 14.8273 12 12 12C9.17273 12 6.64996 11.3482 5 10.3287V12.5ZM19 15.3287C17.35 16.3482 14.8273 17 12 17C9.17273 17 6.64996 16.3482 5 15.3287V17.5C5 17.8134 5.46101 18.3584 6.53047 18.8931C7.91405 19.5849 9.87677 20 12 20C14.1232 20 16.0859 19.5849 17.4695 18.8931C18.539 18.3584 19 17.8134 19 17.5V15.3287ZM3 17.5V7.5C3 5.01472 7.02944 3 12 3C16.9706 3 21 5.01472 21 7.5V17.5C21 19.9853 16.9706 22 12 22C7.02944 22 3 19.9853 3 17.5ZM12 10C14.1232 10 16.0859 9.58492 17.4695 8.89313C18.539 8.3584 19 7.81342 19 7.5C19 7.18658 18.539 6.6416 17.4695 6.10687C16.0859 5.41508 14.1232 5 12 5C9.87677 5 7.91405 5.41508 6.53047 6.10687C5.46101 6.6416 5 7.18658 5 7.5C5 7.81342 5.46101 8.3584 6.53047 8.89313C7.91405 9.58492 9.87677 10 12 10Z"></path>
</svg>`;

export { renderFooter };
