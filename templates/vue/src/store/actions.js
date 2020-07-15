import TapestryApi from "../services/TapestryAPI"

const LOCAL_PROGRESS_ID = "tapestry-progress"

const client = new TapestryApi(wpPostId)

export async function updateSettings({ commit }, newSettings) {
  await client.updateSettings(JSON.stringify(newSettings))
  commit("updateSettings", newSettings)
}

export async function updateH5pSettings({ commit }, newSettings) {
  await client.updateH5pSettings(newSettings)
  commit("updateH5pSettings", newSettings)
}

// nodes
export async function addNode({ commit, dispatch, getters }, newNode) {
  const response = await client.addNode(JSON.stringify(newNode))

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

  const newNode = { ...payload.newNode }
  newNode.id = response.data.id
  const id = payload.id
  commit("updateNode", {
    id,
    newNode: newNode,
  })
  commit("updateNodeCoordinates", {
    id,
    coordinates: {
      [getters.xOrFx]: newNode.coordinates.x,
      [getters.yOrFy]: newNode.coordinates.y,
    },
  })
  dispatch("updateNodePermissions", { id, permissions: newNode.permissions })
  return id
}

export async function updateLockedStatus({ commit }, id) {
  const nodeProgress = await client.getNodeProgress(id)
  const { accessible, unlocked } = nodeProgress
  commit("updateNode", { id, newNode: { accessible, unlocked } })
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
  thisTapestryTool.updateProgressBars()
}

export async function updateUserProgress() {
  const progress = await client.getUserProgress()
  thisTapestryTool.setDatasetProgress(progress)
  thisTapestryTool.reload()
}

export async function completeNode({ commit, dispatch, getters }, nodeId) {
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
  thisTapestryTool.updateAccordionProgress()

  const node = getters.getNode(nodeId)
  if (node.mediaType !== "video") {
    await dispatch("updateNodeProgress", {
      id: nodeId,
      progress: 1,
    })
  }
  if (wpData.wpUserId) {
    dispatch("updateUserProgress")
  }
}

export function updateNodePermissions(_, payload) {
  client.updatePermissions(payload.id, JSON.stringify(payload.permissions))
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
export async function addLink({ commit }, newLink) {
  await client.addLink(JSON.stringify(newLink))
  commit("addLink", newLink)
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

export async function refetchTapestryData(_, filterUserId = null) {
  const query = filterUserId === null ? {} : { filterUserId: filterUserId }
  const tapestry = await client.getTapestry(query)
  tapestry.nodes.map(n => {
    if (tapestry.settings.autoLayout) {
      delete n.fx
      delete n.fy
    } else {
      n.fx = n.coordinates.x
      n.fy = n.coordinates.y
    }
  })
  thisTapestryTool.setDataset(tapestry)
  thisTapestryTool.setOriginalDataset(tapestry)
  thisTapestryTool.reinitialize()
}
