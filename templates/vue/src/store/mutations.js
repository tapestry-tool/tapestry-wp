import Vue from "vue"
import * as getters from "./getters"
import { DEFAULT_DEPTH } from "@/utils/constants"

export function init(state, { dataset, progress = {} }) {
  const datasetWithProgress = setDatasetProgress(
    parseDataset(dataset),
    applyLocalProgress(progress)
  )
  setDataset(state, datasetWithProgress)
  state.selectedNodeId = dataset.rootId
  Object.values(state.nodes)
    .filter(n => n.mediaType === "accordion" || n.isSubAccordion)
    .forEach(n => initializeOrdering(state, n.id))
  state.visibleNodes = Object.keys(state.nodes).map(id => parseInt(id, 10))
}

function applyLocalProgress(progress) {
  if (!wpData.wpUserId) {
    const localProgress = localStorage.getItem("tapestry-progress")
    if (localProgress) {
      const userProgress = JSON.parse(localProgress)
      Object.keys(progress)
        .filter(nodeId => userProgress.hasOwnProperty(nodeId))
        .forEach(nodeId => {
          const nodeProgress = userProgress[nodeId]
          const newProgress = progress[nodeId]
          newProgress.progress = nodeProgress.progress
        })
    }
  }
  return progress
}

function parseDataset(dataset) {
  for (const node of dataset.nodes) {
    const { imageURL, lockedImageURL } = node
    const { mediaURL } = node.typeData
    if (imageURL) {
      node.imageURL = imageURL.replace(/(http(s?)):\/\//gi, "//")
    }
    if (lockedImageURL) {
      node.lockedImageURL = lockedImageURL.replace(/(http(s?)):\/\//gi, "//")
    }
    if (mediaURL && typeof mediaURL === "string") {
      node.typeData.mediaURL = mediaURL.replace(/(http(s?)):\/\//gi, "//")
    }
  }

  for (const node of dataset.nodes.filter(node => node.mediaType === "accordion")) {
    const accordionRowIds = getChildIds({ links: dataset.links }, node.id)
    accordionRowIds.forEach(accordionRowId => {
      const accordionRow = getNode(dataset, accordionRowId)
      accordionRow.presentationStyle = "accordion-row"
      const subRows = getChildIds({ links: dataset.links }, accordionRowId)
      if (subRows.length) {
        accordionRow.isSubAccordion = true
      }
      subRows.forEach(id => {
        const subRow = getNode(dataset, id)
        subRow.presentationStyle = "accordion-row"
      })
    })
  }

  dataset.links = dataset.links.filter(link => {
    const { source, target } = link
    return (
      getNode(dataset, source) !== undefined &&
      getNode(dataset, target) !== undefined
    )
  })

  const { defaultDepth } = dataset.settings
  if (defaultDepth === undefined) {
    dataset.settings.defaultDepth = DEFAULT_DEPTH
  }

  return dataset
}

function getNode(dataset, nodeId) {
  return dataset.nodes.find(node => node.id == nodeId)
}

function setDatasetProgress(dataset, progress) {
  if (!wpData.wpUserId) {
    localStorage.setItem("tapestry-progress", JSON.stringify(progress))
  }
  for (const [id, nodeProgress] of Object.entries(progress)) {
    const node = dataset.nodes.find(node => node.id == id)
    if (node) {
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
          Object.entries(nodeProgress.quiz).forEach(
            ([questionId, completionInfo]) => {
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
            }
          )
        }
      }
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

export function updateDataset(state, { nodes, links }) {
  nodes.additions.forEach(node => addNode(state, node))
  nodes.deletions.forEach(node => {
    if (node.id == state.selectedNodeId) {
      state.selectedNodeId = state.rootId
    }
    deleteNode(state, node.id)
  })
  links.additions.forEach(link => addLink(state, link))
  links.deletions.forEach(link => deleteLink(state, link))
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
  Vue.set(state.nodes, node.id, node)
}

export function deleteNode(state, id) {
  Vue.delete(state.nodes, id)
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
  const node = getters.getNode(state)(payload.id)
  state.nodes[payload.id] = {
    ...node,
    progress: payload.progress,
  }
}

export function updateNodeCoordinates(state, payload) {
  const node = getters.getNode(state)(payload.id)
  Object.entries(payload.coordinates).forEach(([key, value]) => {
    node[key] = value
  })
}

export function fulfillNodeCondition(state, { id, condition }) {
  const node = getters.getNode(state)(id)
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

export function deleteLink(state, { source, target }) {
  state.links = state.links.filter(
    link => link.source !== source || link.target !== target
  )
}

// quizzes
export function completeQuestion(state, { nodeId, questionId }) {
  const node = getters.getNode(state)(nodeId)
  const question = node.quiz.find(question => question.id === questionId)
  question.completed = true
}

export function updateEntry(state, { answerType, entry, nodeId, questionId }) {
  const node = getters.getNode(state)(nodeId)
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
  const node = getters.getNode(state)(payload.id)
  node.childOrdering = payload.ord
}

export function updateVisibleNodes(state, nodes) {
  state.visibleNodes = nodes
}
