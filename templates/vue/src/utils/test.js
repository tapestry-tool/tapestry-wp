import { render as r } from "@testing-library/vue"
import { store } from "@/store"
import { routes } from "@/router"
import { parse, makeMockProgress } from "./dataset"
import Helpers from "./Helpers"

/**
 * An extension over @testing-library's `render` function that accepts additional
 * Tapestry specific options and parses them into the global state format.
 */
export function render(
  component,
  { fixture = null, settings = {}, ...options } = {},
  callback = () => {}
) {
  return r(
    component,
    {
      store: {
        ...store,
        state: {
          ...store.state,
          ...parseFixture(fixture, settings),
        },
      },
      routes,
      ...options,
    },
    callback
  )
}

export function addNode(tapestry, parentId, partialNode) {
  const copy = Helpers.deepCopy(tapestry)

  if (copy.nodes.length > 0 && !parentId) {
    throw new Error(`Cannot add a root node to a non-empty Tapestry.`)
  }

  if (parentId && !copy.nodes.find(node => node.id == parentId)) {
    throw new Error(`Invalid parent node. Cannot find a node with id ${parentId}.`)
  }

  const node = Helpers.createDefaultNode(partialNode)
  node.id = parentId ? parentId + 1 : 1
  copy.nodes.push(node)

  if (parentId) {
    copy.links.push({ source: parentId, target: node.id })
  }
  return copy
}

/**
 * Mock settings object based off a real Tapestry. Make sure to update this whenever
 * changes are made to the Tapestry settings.
 */
const mockSettings = {
  tapestrySlug: "testing",
  title: "testing",
  status: "publish",
  backgroundUrl: "",
  autoLayout: false,
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
  showRejected: false,
}

function parseFixture(fixture, settings) {
  if (fixture) {
    const state = parse(fixture, makeMockProgress(fixture))
    state.settings = { ...Helpers.deepCopy(mockSettings), ...settings }
    state.rootId = Object.keys(state.nodes)[0]
    state.favourites = fixture.favourites || []
    return state
  }
  return {}
}
