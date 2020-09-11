import Lightbox from "@/components/Lightbox"
import store from "@/store"

const ROOT_PATH = `/nodes/:nodeId`

const parseParams = route => {
  const parsedParams = {}
  for (const key in route.params) {
    const val = route.params[key]
    parsedParams[key] = Number(val)
  }
  return parsedParams
}

const app = {
  path: ROOT_PATH,
  name: "app",
}

const lightbox = {
  path: `${ROOT_PATH}/view`,
  name: "lightbox",
  components: {
    lightbox: Lightbox,
  },
  props: {
    lightbox: parseParams,
  },
}

const accordion = {
  path: `${ROOT_PATH}/view/:rowId`,
  name: "accordion",
  components: {
    lightbox: Lightbox,
  },
  props: {
    lightbox: parseParams,
  },
}

const subAccordion = {
  path: `${ROOT_PATH}/view/:rowId/row/:subRowId`,
  name: "sub_accordion",
  components: {
    lightbox: Lightbox,
  },
  props: {
    lightbox: parseParams,
  },
}

const settings = {
  path: `${ROOT_PATH}/settings/:tab`,
  name: "settings",
}

const modal = {
  path: `${ROOT_PATH}/:type/:tab`,
  name: "modal",
  beforeEnter: (to, _, next) => {
    const { nodeId } = to.params
    if (store.state.nodes.hasOwnProperty(nodeId)) {
      next()
    } else {
      next({ name: app.name, params: { nodeId: store.state.rootId } })
    }
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

const routes = {
  app,
  accordion,
  lightbox,
  modal,
  settings,
  subAccordion,
  redirects,
}

export const names = Object.fromEntries(
  Object.entries(routes).map(([name, route]) => [name.toUpperCase(), route.name])
)

export default routes
