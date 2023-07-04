/**
 * Toggles a specific active class on an element.
 * Enforces that only one active class of a certain type can be active at a time
 */
function toggleActiveClass(selector: string, type: string) {
  const activeType = `${type}-active`;
  // remove any active classes
  const elementsToClear = document.querySelectorAll(`.${activeType}`);
  elementsToClear?.forEach((element) => {
    element.classList.remove(activeType);
  });
  // assign activeType to selector
  const elementToActivate = document.querySelector(selector);
  elementToActivate?.classList.add(activeType);
}

export { toggleActiveClass };
