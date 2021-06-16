import Lightbox from "@/components/Lightbox"
import TydeApp from "@/components/tyde"

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

const tydeapp = {
  path: `${ROOT_PATH}/multicontent`,
  name: "tydeapp",
  components: {
    tydeapp: TydeApp,
  },
  props: {
    tydeapp: parseParams,
  },
}

const multiContent = {
  path: `${ROOT_PATH}/view/:rowId`,
  name: "multiContent",
  components: {
    lightbox: Lightbox,
  },
  props: {
    lightbox: parseParams,
  },
}

const nestedMultiContent = {
  path: `${ROOT_PATH}/view/:rowId/rows/:subRowId`,
  name: "nested_multi_content",
  components: {
    lightbox: Lightbox,
  },
  props: {
    lightbox: parseParams,
  },
}

const multiContent2 = {
  path: `${ROOT_PATH}/multicontent/:rowId`,
  name: "multiContent2",
  components: {
    tydeapp: TydeApp,
  },
  props: {
    tydeapp: parseParams,
  },
}

const nestedMultiContent2 = {
  path: `${ROOT_PATH}/multicontent/:rowId/rows/:subRowId`,
  name: "nested_multi_content2",
  components: {
    tydeapp: TydeApp,
  },
  props: {
    tydeapp: parseParams,
  },
}

const settings = {
  path: `${ROOT_PATH}/settings/:tab`,
  name: "settings",
}

const modal = {
  path: `${ROOT_PATH}/:type/:tab`,
  name: "modal",
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
  {
    path: `${ROOT_PATH}/tyde`,
    redirect: `${ROOT_PATH}/tyde/multicontent`,
  },
]

const routes = {
  app,
  multiContent,
  lightbox,
  modal,
  settings,
  nestedMultiContent,
  redirects,
  tydeapp,
  multiContent2,
  nestedMultiContent2,
}

export const names = Object.fromEntries(
  Object.entries(routes).map(([name, route]) => [name.toUpperCase(), route.name])
)
console.log(names)
export default routes
