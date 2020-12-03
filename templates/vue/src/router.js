import Vue from "vue"
import VueRouter from "vue-router"
import routeConfig, { names } from "./config/routes"
import store from "./store"

Vue.use(VueRouter)

export const routes = [
  routeConfig.app,
  routeConfig.lightbox,
  routeConfig.accordion,
  routeConfig.subAccordion,
  routeConfig.settings,
  ...routeConfig.redirects,
  routeConfig.modal,
]

const router = new VueRouter({
  routes,
})

router.beforeEach((to, from, next) => {
  const nodes = Object.keys(store.state.nodes)
  if (to.matched.length === 0 && nodes.length > 0) {
    next({ name: names.APP, params: { nodeId: store.state.rootId } })
  } else {
    next()
  }
})

export default router
