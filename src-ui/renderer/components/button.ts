import "./button.css";

interface Button {
  title: string; // accessibility title for button
  onClick: (args: any) => void;
  className?: string;
  html?: string;
  style?: Partial<CSSStyleDeclaration>;
}

/**
 * Generic function for creating button elements
 */
const renderButton = (button: Button) => {
  const element = document.createElement("button");
  element.title = button.title;
  element.onclick = (args) => button.onClick(args);
  if (button.className) element.className = button.className;
  if (button.html) element.innerHTML = button.html;
  if (button.style) {
    for (const key in button.style) {
      if (button.style.hasOwnProperty(key)) {
        (element.style as any)[key] = (button.style as any)[key];
      }
    }
  }
  return element;
};

export { renderButton };
export type { Button };
