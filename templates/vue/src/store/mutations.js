import Vue from "vue"
import * as getters from "./getters"
import { parse } from "@/utils/dataset"
import Helpers from "@/utils/Helpers"

export function init(state, dataset) {
  const datasetWithProgress = parse(dataset, dataset["userProgress"])
  Object.entries(datasetWithProgress).forEach(([key, value]) => {
    if (key === "nodes") {
      state.nodes = {}
      let maxLevel = 1
      Object.values(value).forEach(node => {
        // Has to call Vue.set so `state.nodes` is reactive
        Vue.set(state.nodes, node.id, node)
        maxLevel = Math.max(maxLevel, node.level)
      })
      state.maxLevel = maxLevel
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

// nodes
export function updateRootNode(state, newNodeId) {
  state.rootId = newNodeId
}

export function addNode(state, node) {
  Vue.set(state.nodes, node.id, node)
}

export function deleteNode(state, id) {
  state.selection = state.selection.filter(nodeId => nodeId !== parseInt(id))
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

export function reverseLink(state, newLink) {
  const linkIndex = state.links.findIndex(
    link => link.target == newLink.target && link.source == newLink.source
  )

  state.links[linkIndex].target = newLink.source
  state.links[linkIndex].source = newLink.target
}

export function deleteLink(state, { source, target }) {
  state.links = state.links.filter(
    link => link.source !== source || link.target !== target
  )
}

// activities
export function completeQuestion(state, { nodeId, questionId, answerType, answer }) {
  const node = getters.getNode(state)(nodeId)

  const question = node.typeData.activity.questions.find(
    question => question.id === questionId
  )

  question.completed = true

  if (
    state.userAnswers[nodeId] === undefined ||
    state.userAnswers[nodeId].activity === undefined
  ) {
    state.userAnswers[nodeId] = { activity: {} }
  }
  if (state.userAnswers[nodeId].activity[questionId] === undefined) {
    state.userAnswers[nodeId].activity[questionId] = { answers: {} }
  }

  if (typeof state.userAnswers[nodeId].activity[questionId].answers === "string") {
    state.userAnswers[nodeId].activity[questionId].answers = {}
  }

  state.userAnswers[nodeId].activity[questionId].answers[answerType] = answer
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

export function updateVisibleNodeParents(state, parentsObj) {
  state.visibleNodeParents = parentsObj
}

export function addApiError(state, error) {
  state.apiError = error
}

export function setTapestryErrorReporting(state, isEnabled) {
  state.displayErrors = isEnabled
}

export function changeTheme(state, newTheme) {
  state.theme = newTheme
}

export function setReturnRoute(state, route) {
  state.returnRoute = route
}

export function updateBrowserDimensions(state) {
  state.browserDimensions.width = Helpers.getBrowserWidth()
  state.browserDimensions.height = Helpers.getBrowserHeight()
}

export function setCurrentEditingNode(state, node) {
  state.currentEditingNode = node
}

export function setCurrentEditingNodeProperty(state, { property, value }) {
  if (state.currentEditingNode) {
    const deep = property.includes(".")
    if (deep) {
      let anchor = state.currentEditingNode
      const path = property.split(".")
      const lastKey = path.pop()
      for (const key of path) {
        anchor = anchor[key]
      }
      if (!anchor.hasOwnProperty(lastKey)) {
        Vue.set(anchor, lastKey, value) // for triggering view re-renders
      } else {
        anchor[lastKey] = value
      }
    } else {
      if (!state.currentEditingNode.hasOwnProperty(property)) {
        Vue.set(state.currentEditingNode, property, value) // for triggering view re-renders
      } else {
        state.currentEditingNode[property] = value
      }
    }
  }
}

export function setNodeNavigation(state, nav) {
  state.nodeNavigation = {
    ...state.nodeNavigation,
    ...nav,
  }
}

export function updateMaxLevel(state) {
  const newMaxLevel = Object.values(state.nodes).reduce(
    (acc, node) => Math.max(acc, node.level),
    1
  )
  if (state.maxLevel !== newMaxLevel) {
    state.maxLevel = newMaxLevel
  }
}

export function setMaxLevel(state, maxLevel) {
  state.maxLevel = maxLevel
}

export function setCurrentDepth(state, depth) {
  state.currentDepth = depth
}

export function setScaleConstants(state, scaleConstants) {
  state.scaleConstants = scaleConstants
}

export function setCurrentTool(state, tool) {
  state.currentTool = tool
}

export function setFullscreenDropzone(state, fullscreenDropzone) {
  state.fullscreenDropzone = fullscreenDropzone
}

export function setNotifications(state, notifications) {
  state.notifications = notifications
}
