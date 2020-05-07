import TapestryApi from "../services/TapestryAPI"

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
export async function addNode({ commit }, newNode) {
  const response = await client.addNode(JSON.stringify(newNode))

  const nodeToAdd = { ...newNode }
  nodeToAdd.id = response.data.id
  nodeToAdd.author = wpData.wpUserId

  commit("addNode", nodeToAdd)
  return nodeToAdd.id
}

export async function updateNode({ commit }, payload) {
  const response = await client.updateNode(
    payload.id,
    JSON.stringify(payload.newNode)
  )

  const newNode = { ...payload.newNode }
  newNode.id = response.data.id
  commit("updateNode", {
    id: payload.id,
    newNode: newNode,
  })
  return payload.id
}

export async function updateNodeProgress({ commit }, payload) {
  const { id, progress } = payload
  await client.updateUserProgress(id, progress)
  commit("updateNodeProgress", { id, progress })
  thisTapestryTool.updateProgressBars()
}

export async function completeNode({ commit, getters }, nodeId) {
  await client.completeNode(nodeId)
  commit("updateNode", {
    id: nodeId,
    newNode: { completed: true },
  })
  thisTapestryTool.updateAccordionProgress()

  const node = getters.getNode(nodeId)
  if (node.mediaType !== "video") {
    commit("updateNodeProgress", {
      id: nodeId,
      progress: 1,
    })
    thisTapestryTool.updateProgressBars()
  }
}

export function updateMayUnlockNodes({ commit, getters }, nodeId) {
  const node = getters.getNode(nodeId)
  node.mayUnlockNodes.forEach(element => {
    commit("fulfillNodeCondition", {
      id: element.id,
      condition: element.condition,
    })
  })
  thisTapestryTool.reloadTooltips()
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
export async function updateUserFavourites({ commit }, favourites) {
  commit("updateFavourites", { favourites })
  await client.updateUserFavourites(JSON.stringify(favourites))
}
