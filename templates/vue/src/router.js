import Vue from "vue"
import VueRouter from "vue-router"
import client from "./services/TapestryAPI"

import routeConfig, { names } from "./config/routes"
import store from "./store"

Vue.use(VueRouter)

export const routes = [
  routeConfig.app,
  routeConfig.lightbox,
  routeConfig.multiContent,
  routeConfig.nestedMultiContent,
  routeConfig.settings,
  routeConfig.userSettings,
  routeConfig.linkmodal,
  ...routeConfig.redirects,
  routeConfig.modal,
  routeConfig.help,
  routeConfig.userAnswers,
]

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
      from.params.rowId !== to.params.rowId ||
      from.query.row !== to.query.row ||
      from.params.subRowId !== to.params.subRowId)
  ) {
    clearTimeout(userLastSelectedNodeTimeout)
    userLastSelectedNodeTimeout = setTimeout(() => {
      client.updateUserLastSelectedNode(
        to.params.nodeId,
        to.params.rowId ? to.params.rowId : to.query.row,
        to.params.subRowId
      )
    }, 5000)
  }
})

export default router
