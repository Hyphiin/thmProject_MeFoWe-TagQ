import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import StartPage from "../views/StartPage.vue";
import Quiz from "../views/Quiz.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "StartPage",
    component: StartPage,
  },
  {
    path: "/learn",
    name: "Learn",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Learn.vue"),
  },
  {
    path: "/Quiz",
    name: "Quiz",
    component: Quiz,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
