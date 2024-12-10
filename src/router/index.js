import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "mainPage",
    component: () => import(/* webpackChunkName: "about" */ "@/views/mainPage"),
  },
  {
    path: "/diagramEditor",
    name: "dragDemo",
    component: () =>
      import(/* webpackChunkName: "about" */ "@/views/diagramEditor/index.vue"),
  },
  {
    path: "/dargeDemo",
    name: "dargeDemo",
    component: () => import("@/views/dargeDemo"),
  },
  {
    path: "/demo3",
    name: "demo3",
    component: () => import("@/views/demo3"),
  },
  {
    path: "/projectManagement",
    name: "projectManagement",
    component: () => import("@/views/projectManagement"),
  },
  {
    path: "/modelManagement",
    name: "modelManagement",
    component: () => import("@/views/modelManagement"),
  },
  {
    path: "/diagramEditor/:diagramType/:diagramId/:modelId?/:projectId?",
    name: "DiagramEditor",
    component: () => import("@/views/diagramEditor/index.vue"),
    props: true, // 允许通过路由参数传递 diagramId, modelId, projectId, diagramType
  },
  {
    path: "/simulation/:diagramId/:projectId",
    name: "simulation",
    component: () => import("@/views/simulation/index.vue"),
    props: true, // 允许通过路由参数传递 diagramId 和 projectId
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
