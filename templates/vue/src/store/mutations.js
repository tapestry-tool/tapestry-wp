import Vue from "vue"
import * as getters from "./getters"
import { parse } from "@/utils/dataset"
//import Helpers from "@/utils/Helpers"

export function init(state, { dataset, progress = {} }) {
  //console.log("inside init")
  //console.log("dataset is ", dataset)
  //console.log("progress is ", progress)
  const datasetWithProgress = parse(dataset, progress)
  console.log("dataset with progress is ", datasetWithProgress)
  //console.log("state is ", state)
  Object.entries(datasetWithProgress).forEach(([key, value]) => {
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
export function completeQuestion(state, { nodeId, questionId, answer, answerType }) {
  // OLD CODE
  const node = getters.getNode(state)(nodeId)
  //console.log("node is", node)
  const question = node.typeData.activity.questions.find(
    question => question.id === questionId
  )
  //console.log("question is", question)
  question.completed = true
  //fixed
  //console.log("node id is", nodeId)
  //console.log("question id is", questionId)
  //console.log("answer is", answer)
  //console.log("answer type is", answerType)
  //console.log("initially state.userAnswers is", Helpers.deepCopy(state.userAnswers))
  if (
    state.userAnswers[nodeId] === undefined ||
    state.userAnswers[nodeId].activity === undefined
  ) {
    //console.log("if no activity property")
    state.userAnswers[nodeId] = {}
    state.userAnswers[nodeId].activity = {}
  }
  if (state.userAnswers[nodeId].activity[questionId] === undefined) {
    state.userAnswers[nodeId].activity[questionId] = {}
    state.userAnswers[nodeId].activity[questionId].answers = {}
  }
  if (typeof state.userAnswers[nodeId].activity[questionId].answers === "string") {
    state.userAnswers[nodeId].activity[questionId].answers = {}
  }
  //state.progress[nodeId].activity[questionId].answers[answerType] = answer
  console.log("got here before, state.userAnswers is", state.userAnswers)
  console.log("inside mutation answer is", answer)
  console.log("inside mutation type of answer is", typeof answer)
  console.log("inside mutation answerType is", answerType)
  console.log("inside mutation type of answerType is", typeof answerType)
  state.userAnswers[nodeId].activity[questionId].answers[answerType] = answer
  console.log(
    "got here after",
    state.userAnswers[nodeId].activity[questionId].answers
  )
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

export function setTapestryErrorReporting(state, isEnabled) {
  state.displayErrors = isEnabled
}
