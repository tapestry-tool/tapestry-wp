import Lightbox from "@/components/Lightbox"
import TapestryApp from "@/components/TapestryApp"
import NodeModal from "@/components/NodeModal"

const app = {
  path: "/nodes/:nodeId",
  name: "app",
  components: {
    default: TapestryApp,
    modal: NodeModal,
  },
  props: {
    default: route => ({ selectedId: Number(route.params.nodeId) }),
    modal: { show: false },
  },
}

const lightbox = {
  path: "/nodes/:nodeId/view",
  name: "lightbox",
  components: {
    default: TapestryApp,
    lightbox: Lightbox,
    modal: NodeModal,
  },
  props: {
    default: route => ({ selectedId: Number(route.params.nodeId) }),
    lightbox: true,
    modal: { show: false },
  },
}

const settings = {
  path: "/nodes/:nodeId/settings/:tab",
  name: "settings",
  components: {
    default: TapestryApp,
    modal: NodeModal,
  },
  props: {
    default: route => ({ selectedId: Number(route.params.nodeId) }),
    modal: { show: false },
  },
}

const modal = {
  path: "/nodes/:nodeId/:type/:tab",
  name: "modal",
  components: {
    default: TapestryApp,
    modal: NodeModal,
  },
  props: {
    default: route => ({ selectedId: Number(route.params.nodeId) }),
    modal: route => ({
      ...route.params,
      show: true,
      nodeId: Number(route.params.nodeId),
    }),
  },
}

const redirects = [
  {
    path: "/nodes/:nodeId/settings",
    redirect: "/nodes/:nodeId/settings/appearance",
  },
  {
    path: "/nodes/:nodeId/add",
    redirect: "/nodes/:nodeId/add/content",
  },
  {
    path: "/nodes/:nodeId/edit",
    redirect: "/nodes/:nodeId/edit/content",
  },
]

export default { app, lightbox, modal, settings, redirects }
