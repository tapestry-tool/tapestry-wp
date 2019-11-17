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

export function updateSettings(state, newSettings) {
  state.settings = newSettings
}

export function updateH5pSettings(state, newSettings) {
  state.h5pSettings = newSettings
}

export function updateSelectedNode(state, newNodeId) {
  state.selectedNodeId = newNodeId
}

export function updateRootNode(state, newNodeId) {
  state.rootId = newNodeId
}

// nodes
export function addNode(state, node) {
  state.nodes.push(node)
}

export function updateNode(state, payload) {
  const nodeIndex = Helpers.findNodeIndex(payload.id, state)
  const oldNode = state.nodes[nodeIndex]

  const newNode = { ...oldNode }
  Object.entries(payload.newNode).forEach(([key, value]) => {
    newNode[key] = value
  })
  state.nodes[nodeIndex] = newNode
  state.nodes = [...state.nodes]
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

// lightbox
export function openLightbox(state, lightboxId) {
  state.isLightboxOpen = true
  state.lightboxId = lightboxId
}

export function closeLightbox(state) {
  state.isLightboxOpen = false
  state.lightboxId = null
  state.lightboxEl = null
}

export function setLightboxEl(state, el) {
  state.lightboxEl = el
}
