import Vue from "vue"
import VueRouter from "vue-router"
import Lightbox from "./components/Lightbox"

Vue.use(VueRouter)

const routes = [
  {
    path: "/nodes/:nodeId",
    component: Lightbox,
    props: true,
  },
]

const router = new VueRouter({ routes })

export default router
