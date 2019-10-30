import TapestryApi from "../services/TapestryAPI"

const client = new TapestryApi(wpPostId)

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

export function updateNodePermissions(_, payload) {
  client.updatePermissions(payload.id, JSON.stringify(payload.permissions))
}

// links
export async function addLink({ commit }, newLink) {
  await client.addLink(JSON.stringify(newLink))
  commit("addLink", newLink)
}
