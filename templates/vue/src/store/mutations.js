import Vue from "vue"
import * as getters from "./getters"
import { parse } from "@/utils/dataset"
import * as wp from "../services/wp"

export function init(state, { dataset, progress = {} }) {
  const datasetWithProgress = setDatasetProgress(
    parse(dataset),
    applyLocalProgress(progress)
  )
  setDataset(state, datasetWithProgress)
}

function applyLocalProgress(progress) {
  if (!wp.isLoggedIn()) {
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

function setDatasetProgress(dataset, progress) {
  if (!wp.isLoggedIn()) {
    localStorage.setItem("tapestry-progress", JSON.stringify(progress))
  }
  for (const [id, nodeProgress] of Object.entries(progress)) {
    const node = dataset.nodes[id]
    if (node) {
      const willLock = node.unlocked && !nodeProgress.unlocked
      if (willLock && !wp.canEditTapestry()) {
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
      Object.values(value).forEach(node => {
        // Has to call this so `state.nodes` is reactive
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
  Object.assign(node.coordinates, payload.coordinates)
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

export function updateOrdering(state, payload) {
  const node = getters.getNode(state)(payload.id)
  node.childOrdering = payload.ord
}

export function updateVisibleNodes(state, nodes) {
  state.visibleNodes = nodes
}

export function addApiError(state, error) {
  state.apiError = error
}
