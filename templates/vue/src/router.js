import Vue from "vue"
import VueRouter from "vue-router"
import Lightbox from "./components/Lightbox"
import NodeModal from "./components/NodeModal.vue"

Vue.use(VueRouter)

const routes = [
  {
    path: "/nodes/view/:nodeId",
    component: Lightbox,
    props: true,
  },
  {
    path: "/nodes/:modalType/:nodeId",
    component: NodeModal,
    props: true,
    name: "node-modal",
  },
]

const router = new VueRouter({ routes })

let promise = new Promise(resolve => {
  router.start = resolve
})

router.beforeEach(async (to, from, next) => {
  await promise // wait until 'start' called
  next()
})

export default router
