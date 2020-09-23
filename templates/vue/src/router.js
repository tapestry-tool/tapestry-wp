import Vue from "vue"
import VueRouter from "vue-router"

import routes, { names } from "./config/routes"
import store from "./store"

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    routes.app,
    routes.lightbox,
    routes.accordion,
    routes.subAccordion,
    routes.settings,
    ...routes.redirects,
    routes.modal,
  ],
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
