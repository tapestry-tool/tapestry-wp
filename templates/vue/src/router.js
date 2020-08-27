import Vue from "vue"
import VueRouter from "vue-router"
import Lightbox from "./components/Lightbox"
import TapestryApp from "./components/TapestryApp"
import TapestrySidebar from "./components/TapestrySidebar"

Vue.use(VueRouter)

const routes = [
  {
    path: "/nodes/:nodeId",
    components: {
      default: TapestryApp,
      sidebar: TapestrySidebar,
    },
    props: {
      default: route => ({ selectedId: route.params.nodeId }),
      sidebar: { closed: true },
    },
  },
  {
    path: "/nodes/:nodeId/view",
    components: {
      default: TapestryApp,
      sidebar: TapestrySidebar,
      lightbox: Lightbox,
    },
    props: {
      default: route => ({ selectedId: route.params.nodeId }),
      sidebar: { closed: true },
      lightbox: true,
    },
  },
  {
    path: "/nodes/:nodeId/info",
    components: {
      default: TapestryApp,
      sidebar: TapestrySidebar,
    },
    props: {
      default: route => ({ selectedId: route.params.nodeId }),
      sidebar: { closed: false },
    },
  },
]

const router = new VueRouter({ routes })

export default router
