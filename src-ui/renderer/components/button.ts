interface Button {
  title: string; // accessibility title for button
  onClick: (args: any) => void;
  className?: string;
  icon?: string;
  text?: string;
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
  if (button.icon) element.innerHTML = button.icon;
  if (button.text) element.append(button.text);
  return element;
};

export { renderButton };
export type { Button };
