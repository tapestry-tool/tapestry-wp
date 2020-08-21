import Vue from "vue"
import VueRouter from "vue-router"
import Lightbox from "./components/Lightbox"

Vue.use(VueRouter)

const routes = [
  {
    path: "/nodes/:nodeId/view",
    component: Lightbox,
    props: true,
  },
  {
    path: "/nodes/:nodeId",
  },
  {
    path: "/nodes/:nodeId/info",
  },
]

const router = new VueRouter({ routes })

export default router
