import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import VueKonva from "vue-konva";

createApp(App).use(store).use(VueKonva).use(router).mount("#app");
