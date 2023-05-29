enum Marks {
  Bold = "bold",
}

// todo:
// to reduce duplication
// potentially build Element enum of
// menu-button-bold
// then reuse that to create the ElementSelectors

enum ElementSelectors {
  ButtonBold = ".menu-button-bold",
}

export { Marks, ElementSelectors };
