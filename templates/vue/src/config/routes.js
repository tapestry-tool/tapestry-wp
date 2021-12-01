import LinkModal from "@/components/modals/LinkModal"

const parseParams = route => {
  const parsedParams = {}
  for (const key in route.params) {
    const val = route.params[key]
    parsedParams[key] = Number(val)
  }
  return parsedParams
}

export const names = {
  APP: "app",
  LIGHTBOX: "lightbox",
  MODAL: "modal",
  MULTICONTENTMODAL: "multicontenmodal",
  SETTINGS: "settings",
  LINKMODAL: "linkmodal",
  USERSETTINGS: "userSettings",
  HELP: "help",
}

const ROOT_PATH = `/nodes/:nodeId(\\d+)`

export default [
  {
    path: ROOT_PATH,
    name: names.APP,
    children: [
      {
        path: `view/:rowId(\\d+)?`,
        name: names.LIGHTBOX,
        props: {
          lightbox: parseParams,
        },
        children: [
          {
            path: `:type(add|edit)`,
            redirect: `${ROOT_PATH}/view/:rowId/:type/content`,
          },
          {
            path: `:type(add|edit)/:tab`,
            name: names.MULTICONTENTMODAL,
          },
        ],
      },
      {
        path: `:type(add|edit)`,
        redirect: `${ROOT_PATH}/:type/content`,
      },
      {
        path: `:type(add|edit)/:tab`,
        name: names.MODAL,
      },
      {
        path: `link`,
        name: names.LINKMODAL,
        components: {
          linkmodal: LinkModal,
        },
        props: {
          linkmodal: parseParams,
        },
      },
      {
        path: `settings`,
        redirect: `${ROOT_PATH}/settings/appearance`,
        children: [
          {
            path: `/:tab`,
            name: names.SETTINGS,
          },
        ],
      },
      {
        path: `user-settings`,
        redirect: `${ROOT_PATH}/user-settings/avatar`,
        children: [
          {
            path: `:tab`,
            name: names.USERSETTINGS,
          },
        ],
      },
      {
        path: `help`,
        name: names.HELP,
      },
    ],
  },
]
