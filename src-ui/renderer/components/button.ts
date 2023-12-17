interface Button {
  title: string; // accessibility title for button
  onClick: (args: any) => void;
  className?: string;
  icon?: string;
  text?: string;
  html?: string; // if this is passed in, ignores icon and text and renders the html
}

/**
 * Generic function for creating button elements
 */
const renderButton = (button: Button) => {
  const element = document.createElement("button");
  element.title = button.title;
  element.onclick = (args) => button.onClick(args);
  if (button.className) element.className = button.className;
  // by setting innerHtml then appending, the icon is always
  // on the left, with text on right
  if (button.icon && !button.html) element.innerHTML = button.icon;
  if (button.text && !button.html) element.append(button.text);
  if (button.html) element.innerHTML = button.html;
  return element;
};

export { renderButton };
export type { Button };
