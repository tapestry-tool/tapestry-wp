import Lightbox from "@/components/Lightbox"
import LinkModal from "@/components/modals/LinkModal"
const ROOT_PATH = `/nodes/:nodeId`

const parseParams = route => {
  const parsedParams = {}
  for (const key in route.params) {
    const val = route.params[key]
    parsedParams[key] = Number(val)
  }
  return parsedParams
}
const linkParamParser = route => {
  const parsedParams = {}
  for (const key in route.params) {
    const val = route.params[key]
    parsedParams[key] = val
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

const settings = {
  path: `${ROOT_PATH}/settings/:tab`,
  name: "settings",
}

const userAnswers = {
  path: `${ROOT_PATH}/user-answers/:tab`,
  name: "userAnswers",
}

const userSettings = {
  path: `${ROOT_PATH}/user-settings/:tab`,
  name: "userSettings",
}

const linkmodal = {
  path: `${ROOT_PATH}/link`,
  name: "links",
  components: {
    linkmodal: LinkModal,
  },
  props: {
    linkmodal: linkParamParser,
  },
}
const help = {
  path: `${ROOT_PATH}/help`,
  name: "help",
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
    path: `${ROOT_PATH}/user-answers`,
    redirect: `${ROOT_PATH}/user-answers/answers`,
  },
  {
    path: `${ROOT_PATH}/user-settings`,
    redirect: `${ROOT_PATH}/user-settings/theme`,
  },
]

const routes = {
  app,
  multiContent,
  lightbox,
  modal,
  settings,
  linkmodal,
  nestedMultiContent,
  redirects,
  userSettings,
  help,
  userAnswers,
}

export const names = Object.fromEntries(
  Object.entries(routes).map(([name, route]) => [name.toUpperCase(), route.name])
)

export default routes
