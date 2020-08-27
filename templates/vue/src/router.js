import Vue from "vue"
import VueRouter from "vue-router"

import routes from "./config/routes"

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    routes.app,
    routes.lightbox,
    routes.settings,
    ...routes.redirects,
    routes.modal,
  ],
})

export default router
