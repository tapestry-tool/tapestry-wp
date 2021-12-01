import Vue from "vue"
import VueRouter from "vue-router"
import client from "./services/TapestryAPI"

import routes, { names } from "./config/routes"
import store from "./store"

Vue.use(VueRouter)

const router = new VueRouter({
  routes,
})

// sourced from https://stackoverflow.com/questions/58634914
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err.name !== "NavigationDuplicated") throw err
  })
}

router.beforeEach((to, from, next) => {
  const nodes = Object.keys(store.state.nodes)
  if (to.matched.length === 0 && nodes.length > 0) {
    next({ name: names.APP, params: { nodeId: store.state.rootId } })
  } else {
    next()
  }
})

let userLastSelectedNodeTimeout = null

router.afterEach((to, from) => {
  if (
    from.matched.length > 0 &&
    to.matched.length > 0 &&
    (from.params.nodeId !== to.params.nodeId ||
      from.params.rowId !== to.params.rowId)
  ) {
    clearTimeout(userLastSelectedNodeTimeout)
    userLastSelectedNodeTimeout = setTimeout(() => {
      client.updateUserLastSelectedNode(to.params.nodeId, to.params.rowId)
    }, 5000)
  }
})

export default router
