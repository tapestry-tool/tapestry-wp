import client from "../services/TapestryAPI"
import Helpers from "../utils/Helpers"
import ErrorHelper from "../utils/errorHelper"

const LOCAL_PROGRESS_ID = "tapestry-progress"

export async function updateSettings({ commit, dispatch }, newSettings) {
  const response = await client.updateSettings(JSON.stringify(newSettings))
  if (ErrorHelper.isError(response)) {
    dispatch("addTapestryError", response)
    return
  }
  commit("updateSettings", newSettings)
}

export async function updateH5pSettings({ commit, dispatch }, newSettings) {
  const response = await client.updateH5pSettings(newSettings)
  if (ErrorHelper.isError(response)) {
    dispatch("addTapestryError", response)
    return
  }
  commit("updateH5pSettings", newSettings)
}

// nodes
export async function addNode({ commit, dispatch, getters }, newNode) {
  const response = await client.addNode(JSON.stringify(newNode))
  if (ErrorHelper.isError(response)) {
    dispatch("addTapestryError", response)
    return
  }
  const nodeToAdd = { ...newNode }
  const id = response.data.id
  nodeToAdd.id = id
  nodeToAdd.author = response.data.author

  commit("addNode", nodeToAdd)
  commit("updateNodeCoordinates", {
    id,
    coordinates: {
      [getters.xOrFx]: nodeToAdd.coordinates.x,
      [getters.yOrFy]: nodeToAdd.coordinates.y,
    },
  })
  dispatch("updateNodePermissions", { id, permissions: nodeToAdd.permissions })
  return id
}

export async function updateNode({ commit, dispatch, getters }, payload) {
  const response = await client.updateNode(
    payload.id,
    JSON.stringify(payload.newNode)
  )
  if (ErrorHelper.isError(response)) {
    dispatch("addTapestryError", response)
    return
  }
  const newNode = { ...payload.newNode }
  newNode.id = response.data.id
  const id = payload.id
  commit("updateNode", {
    id,
    newNode: newNode,
  })
  if (newNode.coordinates) {
    commit("updateNodeCoordinates", {
      id,
      coordinates: {
        [getters.xOrFx]: newNode.coordinates.x,
        [getters.yOrFy]: newNode.coordinates.y,
      },
    })
  }
  if (newNode.permissions) {
    dispatch("updateNodePermissions", { id, permissions: newNode.permissions })
  }
  return id
}

export async function updateLockedStatus({ commit, getters, dispatch }) {
  const userProgress = await client.getUserProgress()
  if (ErrorHelper.isError(userProgress)) {
    dispatch("addTapestryError", userProgress)
    return
  }
  for (const [nodeId, progress] of Object.entries(userProgress)) {
    const node = getters.getNode(nodeId)
    if (node) {
      const { accessible, unlocked } = progress
      if (
        Helpers.isDifferent(
          {
            accessible: node.accessible,
            unlocked: node.unlocked,
          },
          { accessible, unlocked }
        )
      ) {
        commit("updateNode", { id: nodeId, newNode: { accessible, unlocked } })
      }
    }
  }
}

export async function updateNodeProgress({ commit, dispatch }, payload) {
  const { id, progress } = payload

  if (!wpData.wpUserId) {
    const progressObj = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_ID))
    const nodeProgress = progressObj[id] || {}
    nodeProgress.progress = progress
    localStorage.setItem(LOCAL_PROGRESS_ID, JSON.stringify(progressObj))
  } else {
    const response = await client.updateUserProgress(id, progress)
    if (ErrorHelper.isError(response)) {
      dispatch("addTapestryError", response)
      return
    }
  }

  commit("updateNodeProgress", { id, progress })
}

export async function updateNodeCoordinates({ commit, dispatch }, { id, coordinates }) {
  const response = await client.updateNodeCoordinates(id, coordinates)
  if (ErrorHelper.isError(response)) {
    dispatch("addTapestryError", response)
    return
  }
  commit("updateNode", { id, newNode: { coordinates } })
}

export async function completeNode(context, nodeId) {
  const { commit, dispatch, getters } = context

  if (!wpData.wpUserId) {
    const progressObj = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_ID))
    const nodeProgress = progressObj[nodeId] || {}
    nodeProgress.completed = true
    localStorage.setItem(LOCAL_PROGRESS_ID, JSON.stringify(progressObj))
  } else {
    const response = await client.completeNode(nodeId)
    if (ErrorHelper.isError(response)) {
      dispatch("addTapestryError", response)
      return
    }
  }

  commit("updateNode", {
    id: nodeId,
    newNode: { completed: true },
  })

  const node = getters.getNode(nodeId)
  if (node.mediaType !== "video") {
    const response = await dispatch("updateNodeProgress", {
      id: nodeId,
      progress: 1,
    })
    if (ErrorHelper.isError(response)) {
      dispatch("addTapestryError", response)
      return
    }
  }
  return unlockNodes(context)
}

async function unlockNodes({ commit, getters, dispatch }) {
  const progress = await client.getUserProgress()
  if (ErrorHelper.isError(progress)) {
    dispatch("addTapestryError", progress)
    return
  }
  for (const [id, nodeProgress] of Object.entries(progress)) {
    const currentNode = getters.getNode(id)
    if (
      currentNode &&
      Helpers.isDifferent(
        {
          accessible: nodeProgress.accessible,
          unlocked: nodeProgress.unlocked,
        },
        { accessible: currentNode.accessible, unlocked: currentNode.unlocked }
      )
    ) {
      const { accessible, unlocked, content, conditions } = nodeProgress
      const newNode = { accessible, unlocked, conditions }
      if (accessible) {
        const { quiz, typeData } = content
        newNode.quiz = quiz
        newNode.typeData = typeData
      }
      commit("updateNode", { id, newNode })
    }
  }
}

export function updateNodePermissions(_, payload) {
  client.updatePermissions(payload.id, JSON.stringify(payload.permissions))
}

export async function deleteNode({ commit, dispatch }, id) {
  const response = await client.deleteNode(id)
  if (ErrorHelper.isError(response)) {
    dispatch("addTapestryError", response)
    return
  }
  commit("deleteNode", id)
}

export async function completeQuestion(
  { commit, dispatch },
  { answerType, formId, nodeId, questionId }
) {
  const response = await client.completeQuestion(nodeId, questionId)
  if (ErrorHelper.isError(response)) {
    dispatch("addTapestryError", response)
    return
  }
  if (answerType !== "audioId") {
    const entry = await client.getUserEntry(formId)
    if (ErrorHelper.isError(entry)) {
      dispatch("addTapestryError", entry)
      return
    }
    commit("updateEntry", { answerType, entry, nodeId, questionId })
  }
  commit("completeQuestion", { nodeId, questionId })
}

export async function saveAudio({ commit, dispatch }, { audio, nodeId, questionId }) {
  const response = await client.saveAudio(audio, nodeId, questionId)
  if (ErrorHelper.isError(response)) {
    dispatch("addTapestryError", response)
    return
  }
  commit("updateEntry", {
    answerType: "audioId",
    entry: { audio },
    nodeId,
    questionId,
  })
}

// links
export async function addLink({ commit, dispatch }, newLink) {
  const response = await client.addLink(JSON.stringify(newLink))
  if (ErrorHelper.isError(response)) {
    console.log(response)
    dispatch("addTapestryError", response)
    return
  }
  commit("addLink", newLink)
}

export async function deleteLink({ commit, dispatch }, { source, target }) {
  const response = await client.deleteLink({ source: source, target: target })
  if (ErrorHelper.isError(response)) {
    dispatch("addTapestryError", response)
    return
  }
  commit("deleteLink", { source, target })
}

// favourites
export function toggleFavourite({ dispatch, getters }, id) {
  const favourites = getters.favourites
  const newFavourites = getters.isFavourite(id)
    ? favourites.filter(fid => fid != id)
    : [...favourites, id]
  dispatch("updateUserFavourites", newFavourites)
}

export async function updateUserFavourites({ commit, dispatch }, favourites) {
  const response = await client.updateUserFavourites(JSON.stringify(favourites))
  if (ErrorHelper.isError(response)) {
    dispatch("addTapestryError", response)
    return
  }
  commit("updateFavourites", { favourites })
}

export async function refetchTapestryData({ commit, state, dispatch }, filterUserId = null) {
  const query = filterUserId === null ? {} : { filterUserId: filterUserId }
  const tapestry = await client.getTapestry(query)
  if (ErrorHelper.isError(tapestry)) {
    dispatch("addTapestryError", tapestry)
    return
  }
  const { nodes, links } = state

  const nodeIds = new Set(Object.values(nodes).map(node => node.id))
  const newNodeIds = new Set(tapestry.nodes.map(node => node.id))

  const nodeDiff = {
    additions: tapestry.nodes.filter(node => !nodeIds.has(node.id)),
    deletions: Object.values(nodes).filter(node => !newNodeIds.has(node.id)),
  }

  const getLinkId = link => `${link.source}-${link.target}`
  const currentLinks = new Set(links.map(getLinkId))
  const newLinks = new Set(tapestry.links.map(getLinkId))

  const linkDiff = {
    additions: tapestry.links.filter(link => !currentLinks.has(getLinkId(link))),
    deletions: links.filter(link => !newLinks.has(getLinkId(link))),
  }

  commit("updateDataset", { nodes: nodeDiff, links: linkDiff })
}

export function addTapestryError({ commit }, error) {
  const message = ErrorHelper.getErrorMessage(error)
  commit("addTapestryError", { error: message })
}
