import { render as r } from "@testing-library/vue"
import { store } from "@/store"
import { routes } from "@/router"
import { parse, makeMockProgress } from "./dataset"
import Helpers from "./Helpers"

export function render(
  component,
  { fixture = null, ...options } = {},
  callback = () => {}
) {
  return r(
    component,
    {
      store: {
        ...store,
        state: {
          ...store.state,
          ...parseFixture(fixture),
        },
      },
      routes,
      ...options,
    },
    callback
  )
}

/**
 * Mock settings object based off a real Tapestry. Make sure to update this whenever
 * changes are made to the Tapestry settings.
 */
const settings = {
  tapestrySlug: "testing",
  title: "testing",
  status: "publish",
  backgroundUrl: "",
  autoLayout: false,
  nodeDraggable: true,
  showAccess: true,
  defaultPermissions: {
    public: ["read"],
    authenticated: ["read"],
    editor: ["read"],
    contributor: ["read"],
    subscriber: ["read"],
  },
  superuserOverridePermissions: true,
  permalink: "testing",
}

function parseFixture(fixture) {
  if (fixture) {
    const state = parse(fixture, makeMockProgress(fixture))
    state.settings = Helpers.deepCopy(settings)
    state.rootId = Object.keys(state.nodes)[0]
    state.favourites = fixture.favourites || []
    return state
  }
  return {}
}
