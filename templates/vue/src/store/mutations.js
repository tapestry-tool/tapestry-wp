import Helpers from "../utils/Helpers"

export function init(state, dataset) {
  Object.entries(dataset).forEach(([key, value]) => {
    state[key] = value
  })
  state.selectedNodeId = dataset.rootId
}

export function setDataset(state, dataset) {
  Object.entries(dataset).forEach(([key, value]) => {
    state[key] = value
  })
}

export function changeSettings(state, newSettings) {
  state.settings = newSettings
}

export function changeSelectedNode(state, newNodeId) {
  state.selectedNodeId = newNodeId
}

export function changeRootNode(state, newNodeId) {
  state.rootId = newNodeId
}

// nodes
export function addNode(state, node) {
  state.nodes.push(node)
}

export function updateNode(state, payload) {
  const node = state.nodes[Helpers.findNodeIndex(payload.id, state)]
  Object.entries(payload.newNode).forEach(([key, value]) => {
    node[key] = value
  })
}

export function updateNodeProgress(state, payload) {
  const nodeIndex = Helpers.findNodeIndex(payload.id, state)
  state.nodes[nodeIndex].typeData.progress[0].value = payload.progress
  state.nodes[nodeIndex].typeData.progress[1].value = 1.0 - payload.progress
}

export function updateNodeCoordinates(state, payload) {
  const node = state.nodes[Helpers.findNodeIndex(payload.id, state)]
  Object.entries(payload.coordinates).forEach(([key, value]) => {
    node[key] = value
  })
}

// links
export function addLink(state, link) {
  state.links.push(link)
}
