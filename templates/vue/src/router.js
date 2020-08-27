import Vue from "vue"
import VueRouter from "vue-router"
import Lightbox from "./components/Lightbox"
import TapestryApp from "./components/TapestryApp"

Vue.use(VueRouter)

const routes = [
  {
    path: "/nodes/:nodeId",
    components: {
      default: TapestryApp,
    },
    props: {
      default: route => ({ selectedId: route.params.nodeId }),
    },
  },
  {
    path: "/nodes/:nodeId/view",
    components: {
      default: TapestryApp,
      lightbox: Lightbox,
    },
    props: {
      default: route => ({ selectedId: route.params.nodeId }),
      lightbox: true,
    },
  },
  {
    path: "/nodes/:nodeId/info",
    components: {
      default: TapestryApp,
    },
    props: {
      default: route => ({ selectedId: route.params.nodeId }),
    },
  },
]

const router = new VueRouter({ routes })

export default router
