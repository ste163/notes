enum Marks {
  Bold = "bold",
}

// todo:
// to reduce duplication
// potentially build Element enum of
// menu-button-bold
// then reuse that to create the ElementSelectors
//
// HOWEVER, this is pre-mature optimization. Need more usage before I do it all the way

enum ElementSelectors {
  ButtonBold = ".menu-button-bold",
}

export { Marks, ElementSelectors };
