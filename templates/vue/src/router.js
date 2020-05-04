import Vue from "vue"
import VueRouter from "vue-router"
import Lightbox from "./components/Lightbox"
import TapestryFilter from "./components/TapestryFilter"

Vue.use(VueRouter)

const routes = [
  {
    path: "/nodes/:nodeId",
    component: Lightbox,
    props: true,
  },
  {
    path: "/filter",
    component: TapestryFilter,
    props: true,
  },
  {
    path: "/",
    component: TapestryFilter,
    props: true,
  },
]

const router = new VueRouter({ routes })

export default router
