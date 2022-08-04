import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      chosenOption: "level1",
      level1: [
        "Create a complete html document with 3 div tags and plain css.",
        "Create a complete html document with 3 p tags and plain css.",
        "Create a complete html document with 3 h tags and plain css.",
        "Create a complete html document with 1 div tag and 1 p tag and plain css.",
        "Create a complete html document with 6 div tags and plain css.",
      ],
      level2: [
        "Create a complete html document with multiple div-tags, p-tags and h-tags and plain css",
        "Create a complete html document mutliple nested elements, plain css and no images",
        "Create a complete html document with multiple colored divs with random size, text and plain css as style in head without images",
        "Create a complete html document with multiple colored text-elements with random style and plain css as style in head without images",
        "Create a complete html document with multiple colored list-elements with random style and plain css as style in head without images",
      ],

      level3: [
        "Create a simple html Page for an architect with plain css and no images",
        "Create a html Page for an ice cream shop with plain css without images",
        "Create a html Page for an computer shop with plain css and no images",
        "Create an html Page for a university with plain css and no images",
        "Create an html Page for a music label with plain css and no images",
      ],
    };
  },
  mutations: {
    chooseLevel(state: any, level: string) {
      state.chosenOption = level;
    },
  },
  actions: {},
  modules: {},
});
