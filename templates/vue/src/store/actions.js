import client from "../services/TapestryAPI"
import Helpers from "../utils/Helpers"

const LOCAL_PROGRESS_ID = "tapestry-progress"

export async function updateSettings({ commit }, newSettings) {
  await client.updateSettings(JSON.stringify(newSettings))
  commit("updateSettings", newSettings)
}

export async function updateH5pSettings({ commit }, newSettings) {
  await client.updateH5pSettings(newSettings)
  commit("updateH5pSettings", newSettings)
}

// nodes
export async function addNode({ commit, dispatch, getters, state }, newNode) {
  const response = await client.addNode(JSON.stringify(newNode))

  const nodeToAdd = { ...newNode }
  const id = response.data.id
  nodeToAdd.id = id
  nodeToAdd.author = response.data.author

  commit("addNode", nodeToAdd)
  commit("updateVisibleNodes", [...state.visibleNodes, id])
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

export async function updateLockedStatus({ commit, getters }) {
  const userProgress = await client.getUserProgress()
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

export async function updateNodeProgress({ commit }, payload) {
  const { id, progress } = payload

  if (!wpData.wpUserId) {
    const progressObj = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_ID))
    const nodeProgress = progressObj[id] || {}
    nodeProgress.progress = progress
    localStorage.setItem(LOCAL_PROGRESS_ID, JSON.stringify(progressObj))
  } else {
    await client.updateUserProgress(id, progress)
  }

  commit("updateNodeProgress", { id, progress })
}

export async function updateNodeCoordinates({ commit }, { id, coordinates }) {
  await client.updateNodeCoordinates(id, coordinates)
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
    await client.completeNode(nodeId)
  }

  commit("updateNode", {
    id: nodeId,
    newNode: { completed: true },
  })

  const node = getters.getNode(nodeId)
  if (node.mediaType !== "video") {
    await dispatch("updateNodeProgress", {
      id: nodeId,
      progress: 1,
    })
  }
  return unlockNodes(context)
}

async function unlockNodes({ commit, getters }) {
  const progress = await client.getUserProgress()
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

export async function deleteNode({ commit }, id) {
  await client.deleteNode(id)
  commit("deleteNode", id)
}

export async function completeQuestion(
  { commit },
  { answerType, formId, nodeId, questionId }
) {
  await client.completeQuestion(nodeId, questionId)
  if (answerType !== "audioId") {
    const entry = await client.getUserEntry(formId)
    commit("updateEntry", { answerType, entry, nodeId, questionId })
  }
  commit("completeQuestion", { nodeId, questionId })
}

export async function saveAudio({ commit }, { audio, nodeId, questionId }) {
  await client.saveAudio(audio, nodeId, questionId)
  commit("updateEntry", {
    answerType: "audioId",
    entry: { audio },
    nodeId,
    questionId,
  })
}

// links
export async function addLink({ commit, getters }, newLink) {
  await client.addLink(JSON.stringify(newLink))
  commit("addLink", newLink)

  const parent = getters.getNode(newLink.source)
  commit("updateNode", {
    id: newLink.source,
    newNode: {
      childOrdering: [...parent.childOrdering, newLink.target],
    },
  })
}

export async function deleteLink({ state, commit }, { source, target }) {
  const linkIndex = state.links.findIndex(
    link => link.source === source && link.target === target
  )
  await client.deleteLink(linkIndex)
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

export async function updateUserFavourites({ commit }, favourites) {
  await client.updateUserFavourites(JSON.stringify(favourites))
  commit("updateFavourites", { favourites })
}

export async function refetchTapestryData({ commit, state }, filterUserId = null) {
  const query = filterUserId === null ? {} : { filterUserId: filterUserId }
  const tapestry = await client.getTapestry(query)
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
