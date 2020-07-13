import Vue from "vue"
import Helpers from "../utils/Helpers"

export function init(state, { dataset, progress = {} }) {
  const datasetWithProgress = setDatasetProgress(dataset, progress)
  setDataset(state, datasetWithProgress)
  state.selectedNodeId = dataset.rootId
  state.tapestryIsLoaded = true
  Object.values(state.nodes)
    .filter(n => n.mediaType === "accordion" || n.isSubAccordion)
    .forEach(n => initializeOrdering(state, n.id))
  state.visibleNodes = Object.keys(state.nodes).map(id => parseInt(id, 10))
}

function setDatasetProgress(dataset, progress) {
  for (const [id, nodeProgress] of Object.entries(progress)) {
    const node = dataset.nodes.find(node => node.id == id)
    const willLock = node.unlocked && !nodeProgress.unlocked
    if (willLock && !wpData.wpCanEditTapestry) {
      node.quiz = []
      node.typeData = {}
    }

    node.unlocked = nodeProgress.unlocked
    node.accessible = nodeProgress.accessible
    node.conditions = nodeProgress.conditions
    node.completed = nodeProgress.completed

    const { content } = nodeProgress
    if (content) {
      node.quiz = content.quiz
      node.typeData = content.typeData
    }

    if (node.mediaType !== "accordion") {
      node.progress = nodeProgress.progress
      const questions = node.quiz
      if (nodeProgress.quiz) {
        Object.entries(nodeProgress.quiz).forEach(([questionId, completionInfo]) => {
          const question = questions.find(question => question.id === questionId)
          if (question) {
            question.completed = completionInfo.completed
            question.entries = {}
            Object.entries(completionInfo).forEach(([key, value]) => {
              if (key !== "completed") {
                question.entries[key] = value
              }
            })
          }
        })
      }
    } else {
      const rows = dataset.links
        .filter(link => link.source == node.id)
        .map(link => link.target)
      const completedRows = rows
        .map(id => dataset.nodes.find(node => node.id == id))
        .filter(row => row.completed)
        .map(row => row.id)
      completedRows.forEach(row => progress.push(row.id))
      node.accordionProgress = completedRows

      const currProgress = rows.length ? completedRows.length / rows.length : 1
      node.progress = currProgress
    }
  }
  return dataset
}

export function setDataset(state, dataset) {
  Object.entries(dataset).forEach(([key, value]) => {
    if (key === "nodes") {
      state.nodes = {}
      value.forEach(node => {
        Vue.set(state.nodes, node.id, node)
      })
    } else {
      state[key] = value
    }
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

export function deleteNode(state, id) {
  state.nodes = state.nodes.filter(node => node.id != id)
}

export function updateNode(state, payload) {
  const thisNode = state.nodes[payload.id]
  const copy = { ...thisNode }
  Object.entries(payload.newNode).forEach(([key, value]) => {
    copy[key] = value
  })
  state.nodes[payload.id] = copy
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

export function fulfillNodeCondition(state, { id, condition }) {
  const node = state.nodes[Helpers.findNodeIndex(id, state)]
  const toFulfill = node.conditions.find(
    cond => cond.type === condition.type && cond.value === condition.value
  )
  if (toFulfill) {
    toFulfill.fulfilled = true
    if (node.conditions.every(cond => cond.fulfilled)) {
      node.unlocked = true
      node.accessible = true
    }
  }
}

export function select(state, id) {
  if (!state.selection.includes(id)) {
    state.selection = [...state.selection, parseInt(id)]
  }
}

export function unselect(state, id) {
  state.selection = state.selection.filter(nodeId => nodeId !== parseInt(id))
}

export function clearSelection(state) {
  state.selection = []
}

// links
export function addLink(state, link) {
  state.links.push(link)
}

export function deleteLink(state, linkIndex) {
  state.links = state.links.filter((_, i) => i !== linkIndex)
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

// favourites
export function updateFavourites(state, { favourites }) {
  state.favourites = favourites
}

function getChildIds(state, nodeId) {
  const links = state.links
  return links
    .filter(link =>
      link.source.id == undefined ? link.source == nodeId : link.source.id == nodeId
    )
    .map(link => link.target)
}

export function initializeOrdering(state, id) {
  const node = state.nodes[id]
  getChildIds(state, id)
    .filter(cid => !node.childOrdering.includes(cid))
    .forEach(id => node.childOrdering.push(id))
  const children = getChildIds(state, id)
  node.childOrdering = node.childOrdering.filter(id => children.includes(id))
}

export function updateOrdering(state, payload) {
  const nodeIndex = Helpers.findNodeIndex(payload.id, state)
  state.nodes[nodeIndex].childOrdering = payload.ord
}

export function updateVisibleNodes(state, nodes) {
  state.visibleNodes = nodes
}
