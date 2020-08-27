import Lightbox from "@/components/Lightbox"
import TapestryApp from "@/components/TapestryApp"
import NodeModal from "@/components/NodeModal"

const ROOT_PATH = `/nodes/:nodeId`

const app = {
  path: ROOT_PATH,
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
  path: `${ROOT_PATH}/view`,
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

const accordion = {
  path: `${ROOT_PATH}/view/:rowId`,
  name: "accordion",
  components: {
    default: TapestryApp,
    modal: NodeModal,
    lightbox: Lightbox,
  },
  props: {
    default: route => ({ selectedId: Number(route.params.nodeId) }),
    modal: { show: false },
    lightbox: true,
  },
}

const subAccordion = {
  path: `${ROOT_PATH}/view/:rowId/row/:subRowId`,
  name: "accordion",
  components: {
    default: TapestryApp,
    modal: NodeModal,
    lightbox: Lightbox,
  },
  props: {
    default: route => ({ selectedId: Number(route.params.nodeId) }),
    modal: { show: false },
    lightbox: true,
  },
}

const settings = {
  path: `${ROOT_PATH}/settings/:tab`,
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
  path: `${ROOT_PATH}/:type/:tab`,
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
    path: `${ROOT_PATH}/settings`,
    redirect: `${ROOT_PATH}/settings/appearance`,
  },
  {
    path: `${ROOT_PATH}/add`,
    redirect: `${ROOT_PATH}/add/content`,
  },
  {
    path: `${ROOT_PATH}/edit`,
    redirect: `${ROOT_PATH}/edit/content`,
  },
]

export default { app, accordion, lightbox, modal, settings, subAccordion, redirects }
