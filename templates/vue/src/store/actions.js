import client from "../services/TapestryAPI"
import * as wp from "../services/wp"
import Helpers from "../utils/Helpers"
import ErrorHelper from "../utils/errorHelper"

const LOCAL_PROGRESS_ID = "tapestry-progress"

export async function updateSettings({ commit, dispatch }, newSettings) {
  try {
    await client.updateSettings(JSON.stringify(newSettings))
    commit("updateSettings", newSettings)
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function updateH5pSettings({ commit, dispatch }, newSettings) {
  try {
    await client.updateH5pSettings(newSettings)
    commit("updateH5pSettings", newSettings)
  } catch (error) {
    dispatch("addApiError", error)
  }
}

// userSettings

export async function updateUserSettings({ commit, dispatch }, userSettings) {
  try {
    await client.updateUserSettings(JSON.stringify(userSettings))
    commit("changeTheme", userSettings.theme)
  } catch (error) {
    dispatch("addApiError", error)
  }
}

// nodes
export async function addNode(
  { commit, dispatch, getters, state },
  { node, parentId }
) {
  try {
    const response = await client.addNode({ node, parentId })
    const { node: newNode, link } = response.data
    const nodeToAdd = { ...node }
    const id = newNode.id
    nodeToAdd.id = id
    nodeToAdd.author = newNode.author
    nodeToAdd.comments = newNode.comments
    nodeToAdd.permissions = newNode.permissions
    if (newNode.typeData.h5pMeta) {
      nodeToAdd.typeData.h5pMeta = newNode.typeData.h5pMeta
    }

    commit("addNode", nodeToAdd)
    commit("updateVisibleNodes", [...state.visibleNodes, id])
    commit("updateNodeCoordinates", {
      id,
      coordinates: {
        [getters.xOrFx]: nodeToAdd.coordinates.x,
        [getters.yOrFy]: nodeToAdd.coordinates.y,
      },
    })

    if (parentId) {
      const parent = getters.getNode(parentId)
      commit("updateNode", {
        id: parentId,
        newNode: {
          childOrdering: [...parent.childOrdering, id],
        },
      })
    }

    if (link) {
      commit("addLink", link)
    }

    return id
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function updateNode({ commit, dispatch, getters }, payload) {
  try {
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
    return id
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function updateLockedStatus({ commit, getters, dispatch }) {
  try {
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
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function updateNodeProgress(
  { commit, state, dispatch, getters },
  payload
) {
  // Tapestry editors and admins don't need this feature. We disable this to
  // improve performance for editors and admins by reducing requests.
  if (wp.canEditTapestry()) {
    return
  }
  try {
    const { id, progress } = payload

    const node = getters.getNode(id)
    if (node.completed || node.progress === progress) {
      return
    }

    if (!wp.isLoggedIn()) {
      const progressObj = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_ID))
      const nodeProgress = progressObj[id] || {}
      nodeProgress.progress = progress
      localStorage.setItem(LOCAL_PROGRESS_ID, JSON.stringify(progressObj))
    } else if (
      !state.userProgress[id] ||
      state.userProgress[id].progress !== progress
    ) {
      await client.updateUserProgress(id, progress)
    }
    commit("updateNodeProgress", { id, progress })
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function updateNodeCoordinates(
  { commit, dispatch },
  { id, coordinates, originalCoordinates }
) {
  try {
    await client.updateNodeCoordinates(id, coordinates)
    commit("updateNodeCoordinates", { id, coordinates })
  } catch (error) {
    if (originalCoordinates) {
      commit("updateNodeCoordinates", { id, coordinates: originalCoordinates })
    }
    dispatch("addApiError", error)
    return Promise.reject()
  }
}

export async function completeNode(context, nodeId) {
  // Tapestry editors and admins don't need this feature. We disable this to
  // improve performance for editors and admins by reducing requests.
  if (wp.canEditTapestry()) {
    return
  }
  const { commit, dispatch, getters } = context
  try {
    const node = getters.getNode(nodeId)
    if (node.completed) {
      return
    }

    if (!wp.isLoggedIn()) {
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

    if (node.mediaType !== "video") {
      await dispatch("updateNodeProgress", {
        id: nodeId,
        progress: 1,
      })
    }
    return unlockNodes(context)
  } catch (error) {
    dispatch("addApiError", error)
  }
}

async function unlockNodes({ commit, getters, dispatch }) {
  try {
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
          const { typeData } = content
          newNode.typeData = typeData
        }
        commit("updateNode", { id, newNode })
      }
    }
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function deleteNode({ commit, dispatch }, id) {
  try {
    await client.deleteNode(id)
    commit("deleteNode", id)
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function getNodeHasDraftChildren({ dispatch }, id) {
  try {
    return await client.getNodeHasDraftChildren(id)
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function getTapestryExport({ dispatch }, shouldExportComments) {
  try {
    return await client.getTapestryExport(shouldExportComments)
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function getTapestryExportAsZip({ dispatch }, shouldExportComments) {
  try {
    return await client.getTapestryExportAsZip(shouldExportComments)
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function completeQuestion(
  { commit, dispatch },
  { nodeId, questionId, answerType, answer }
) {
  try {
    await client.completeQuestion(nodeId, questionId, answerType, answer)
    commit("completeQuestion", { nodeId, questionId, answerType, answer })
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function saveAudio({ dispatch }, { nodeId, questionId, audio }) {
  try {
    const response = await client.saveAudio(nodeId, questionId, audio)
    return response
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function reviewNode({ commit, dispatch }, { id, comments }) {
  try {
    const updates = await client.reviewNode(id, comments)
    commit("updateNode", {
      id,
      newNode: updates.data,
    })
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function addComment(
  { commit, dispatch },
  { nodeId, comment, replyingTo }
) {
  try {
    const comments = await client.addComment(nodeId, comment, replyingTo)
    commit("updateNode", {
      id: nodeId,
      newNode: {
        comments,
      },
    })
    return true
  } catch (error) {
    dispatch("addApiError", error)
  }
  return false
}

export async function performCommentAction(
  { commit, dispatch },
  { nodeId, commentId, action }
) {
  try {
    const comments = await client.performCommentAction(nodeId, commentId, action)
    commit("updateNode", {
      id: nodeId,
      newNode: {
        comments,
      },
    })
  } catch (error) {
    dispatch("addApiError", error)
  }
}

// links
export async function addLink({ commit, dispatch, getters }, newLink) {
  try {
    await client.addLink(JSON.stringify(newLink))
    commit("addLink", newLink)

    const parent = getters.getNode(newLink.source)
    commit("updateNode", {
      id: newLink.source,
      newNode: {
        childOrdering: [...parent.childOrdering, newLink.target],
      },
    })
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function reverseLink({ commit, dispatch, getters }, link) {
  try {
    const parent = getters.getNode(link.source)
    await commit("updateNode", {
      id: link.source,
      newNode: {
        childOrdering: parent.childOrdering.filter(item => item !== link.target),
      },
    })

    const child = getters.getNode(link.target)
    commit("updateNode", {
      id: link.target,
      newNode: {
        childOrdering: [...child.childOrdering, link.source],
      },
    })

    await client.reverseLink(JSON.stringify(link))
    commit("reverseLink", link)
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function deleteLink(
  { commit, dispatch },
  { source, target, useClient = true }
) {
  try {
    if (useClient) await client.deleteLink({ source: source, target: target })
    commit("deleteLink", { source, target })
  } catch (error) {
    dispatch("addApiError", error)
  }
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
  try {
    await client.updateUserFavourites(JSON.stringify(favourites))
    commit("updateFavourites", { favourites })
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function refetchTapestryData(
  { commit, state, dispatch },
  filterUserId = null
) {
  try {
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
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export function addApiError({ commit }, error) {
  const message = ErrorHelper.getErrorMessage(error)
  commit("addApiError", { error: message })
}

export function setTapestryErrorReporting({ commit }, isEnabled) {
  commit("setTapestryErrorReporting", isEnabled)
}

export async function updateNotifications({ commit, dispatch }, notifications) {
  try {
    await client.updateNotifications(notifications)
    commit("setNotifications", notifications)
  } catch (error) {
    dispatch("addApiError", error)
  }
}
