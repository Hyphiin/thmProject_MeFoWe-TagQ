import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      chosenOption: "level1",
      level1: [
        "Create a simple html page with multiple div-tags, p-tags and h-tags and plain css",
        "Create a simple html page with mutliple nested elements, plain css and no images",
        "Create a simple html page with multiple colored divs with random size, text and plain css as style in head without images",
        "Create a simple html page with multiple colored text-elements with random style and plain css as style in head without images",
        "Create a simple html page with multiple colored list-elements with random style and plain css as style in head without images",
      ],

      level2: [
        "Create a simple html page for an architect with plain css and no images",
        "Create a html page for an ice cream shop with plain css without images",
        "Create a html Page for an computer shop with plain css and no images",
        "Create an html Page for a university with plain css and no images",
        "Create an html Page for a music label with plain css and no images",
      ],
    };
  },
  mutations: {
    chooseLevel(state: any, level: string) {
      console.log(level);
      state.chosenOption = level;
    },
  },
  actions: {},
  modules: {},
});
