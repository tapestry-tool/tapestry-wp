import { render as r } from "@testing-library/vue"
import { store } from "@/store"
import { parse } from "./dataset"

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

export function parseFixture(fixture) {
  const state = parse(fixture)
  state.settings = settings
  state.rootId = Object.keys(state.nodes)[0]
  state.favourites = fixture.favourites || []
  return state
}

export function render(component, fixture = null, options = {}) {
  return r(component, {
    store: {
      ...store,
      state: parseFixture(fixture),
    },
    ...options,
  })
}
