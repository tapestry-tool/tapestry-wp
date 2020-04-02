import Helpers from "../utils/Helpers"

export function init(state, dataset) {
  setDataset(state, dataset)
  state.selectedNodeId = dataset.rootId
  state.tapestryIsLoaded = true
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

export function setLightbox(state, el) {
  state.lightbox = el
}

// nodes
export function addNode(state, node) {
  state.nodes.push(node)
}

export function updateNode(state, payload) {
  const nodeIndex = Helpers.findNodeIndex(payload.id, state)
  const thisNode = state.nodes[nodeIndex]
  Object.entries(payload.newNode).forEach(([key, value]) => {
    thisNode[key] = value
  })
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

// quizzes
export function completeQuestion(state, { nodeId, questionId }) {
  const node = state.nodes[Helpers.findNodeIndex(nodeId, state)]
  const question = node.quiz.find(question => question.id === questionId)
  question.completed = true
}

export function updateEntry(state, { answerType, entry, nodeId, questionId }) {
  const node = state.nodes[Helpers.findNodeIndex(nodeId, state)]
  const question = node.quiz.find(question => question.id === questionId)
  const entries = question.entries || {}
  entries[answerType] = Object.values(entry)[0]
  question.entries = entries
}

export function updateTydeProgress(state, { parentId, isParentModule }) {
  const parentNode = state.nodes[Helpers.findNodeIndex(parentId, state)]
  const childNodeIds = getChildIds(state, parentId)
  const childNodes = childNodeIds.map(
    id => state.nodes[Helpers.findNodeIndex(id, state)]
  )
  var childProgress, reducer
  if (isParentModule) {
    // parentNode is a module, and all children are stages
    childProgress = childNodes.map(stage => stage.tydeProgress)
    reducer = (accumulator, progress) => accumulator + progress
  } else {
    // parentNode is a stage, and all children are nodes (topics)
    childProgress = childNodes.map(topic => topic.completed)
    reducer = (accumulator, completed) => accumulator + (completed === true ? 1 : 0)
  }
  parentNode.tydeProgress =
    childNodes.length === 0
      ? 1
      : childProgress.reduce(reducer, 0) / childNodes.length
  if (!isParentModule) {
    // If node is stage, parent module must be updated as well
    getParentIds(state, parentId).map(id =>
      updateTydeProgress(state, { parentId: id, isParentModule: true })
    )
  }
}

function getParentIds(state, nodeId) {
  const links = state.links
  return links
    .filter(link =>
      link.target.id == undefined ? link.target == nodeId : link.target.id == nodeId
    )
    .map(link => (link.source.id == undefined ? link.source : link.source.id))
}

function getChildIds(state, nodeId) {
  const links = state.links
  return links
    .filter(link =>
      link.source.id == undefined ? link.source == nodeId : link.source.id == nodeId
    )
    .map(link => (link.target.id == undefined ? link.target : link.target.id))
}
