import client from "../services/TapestryAPI"
import * as wp from "../services/wp"
import Helpers from "../utils/Helpers"
import ErrorHelper from "../utils/errorHelper"

const LOCAL_PROGRESS_ID = "tapestry-progress"

// undo / redo
export async function command({ state }, command) {
  // do not call this action directly; instead call buildCommand
  return state.commandHistory.doCommand(command)
}

export async function undo({ state }) {
  return state.commandHistory.undo()
}

export async function redo({ state }) {
  return state.commandHistory.redo()
}

export async function buildCommand({ dispatch }, options) {
  const {
    name,
    executeAction,
    executePayload,
    executeCallback,
    undoAction,
    undoPayload,
    undoCallback,
    replace = null,
  } = options
  // NOTE: undoAction and undoPayload are optional; they default to their execute counterparts
  return dispatch("command", {
    name,
    execute: async () => {
      const result = await dispatch(executeAction, executePayload)
      if (executeCallback) {
        await dispatch("buildCommand", {
          ...options,
          ...executeCallback(result),
          replace: "previous",
        })
      }
      return result
    },
    undo: async () => {
      const result = await dispatch(
        undoAction ?? executeAction,
        undoPayload ?? executePayload
      )
      if (undoCallback) {
        await dispatch("buildCommand", {
          ...options,
          ...undoCallback(result),
          replace: "next",
        })
      }
    },
    replace,
  })
}

// settings
export async function updateSettings({ state, dispatch }, newSettings) {
  await dispatch("buildCommand", {
    name: "update settings",
    executeAction: "doUpdateSettings",
    executePayload: newSettings,
    undoPayload: state.settings,
  })
}

export async function doUpdateSettings({ commit, dispatch }, newSettings) {
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
export async function updateUserSettings({ state, dispatch }, userSettings) {
  await dispatch("buildCommand", {
    name: "update user settings",
    executeAction: "doUpdateUserSettings",
    executePayload: userSettings,
    undoPayload: { theme: state.theme },
  })
}

export async function doUpdateUserSettings({ commit, dispatch }, userSettings) {
  try {
    await client.updateUserSettings(JSON.stringify(userSettings))
    commit("changeTheme", userSettings.theme)
  } catch (error) {
    dispatch("addApiError", error)
  }
}

// nodes
export async function addNode({ dispatch }, payload) {
  return dispatch("buildCommand", {
    name: "add node",
    executeAction: "doAddNode",
    executePayload: payload,
    executeCallback: addedNodeId => ({
      undoPayload: addedNodeId,
    }),
    undoAction: "doDeleteNode",
    undoPayload: null,
    undoCallback: nodeIdAndLinks => ({
      executeAction: "doRestoreNode",
      executePayload: nodeIdAndLinks,
      executeCallback: null,
    }),
  })
}

export async function doAddNode(
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

    if (node.level > state.maxLevel) {
      commit("setMaxLevel", node.level)
    }

    return id
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function batchUpdateNodes({ dispatch, getters }, payloads) {
  let undoPayloads = []
  for (const payload of payloads) {
    const node = getters.getNode(payload.id)
    const newNode = { ...payload.newNode }
    for (const key in newNode) {
      newNode[key] = node[key]
    }
    undoPayloads.push({
      id: payload.id,
      newNode,
    })
  }
  return dispatch("buildCommand", {
    name: "update multiple nodes",
    executeAction: "doBatchUpdateNodes",
    executePayload: payloads,
    undoAction: "doBatchUpdateNodes",
    undoPayload: undoPayloads,
  })
}

export async function doBatchUpdateNodes(
  { commit, dispatch, getters, state },
  payloads
) {
  try {
    const successNodeIds = (await client.batchUpdateNodes(JSON.stringify(payloads)))
      .data

    const linkDirectionUpdates = []
    let failedCount = 0

    for (const payload of payloads) {
      const id = payload.id
      if (!successNodeIds.includes(id)) {
        failedCount++
        continue
      }
      const oldNode = getters.getNode(id)
      const newNode = { ...payload.newNode }
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

      if (newNode.level && newNode.level !== oldNode.level) {
        if (newNode.level > state.maxLevel) {
          commit("setMaxLevel", newNode.level)
        } else if (oldNode.level === state.maxLevel) {
          commit("updateMaxLevel")
        }
        linkDirectionUpdates.push(id)
      }
    }

    for (const nodeId of linkDirectionUpdates) {
      dispatch("updateLinkDirections", nodeId)
    }

    if (failedCount !== 0) {
      commit("addApiError", {
        error: `Failed to update ${failedCount} of the nodes.`,
      })
    }

    return failedCount === 0
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function updateNode({ dispatch, getters }, payload) {
  const node = getters.getNode(payload.id)
  let undoPayload = {
    id: payload.id,
    newNode: { ...payload.newNode },
  }
  for (const key in undoPayload.newNode) {
    undoPayload.newNode[key] = node[key]
  }
  return dispatch("buildCommand", {
    name: "update node",
    executeAction: "doUpdateNode",
    executePayload: payload,
    undoAction: "doUpdateNode",
    undoPayload: undoPayload,
  })
}

export async function doUpdateNode({ commit, dispatch, getters, state }, payload) {
  try {
    const response = await client.updateNode(
      payload.id,
      JSON.stringify(payload.newNode)
    )

    const oldNode = getters.getNode(payload.id)

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

    if (newNode.level && newNode.level !== oldNode.level) {
      if (newNode.level > state.maxLevel) {
        commit("setMaxLevel", newNode.level)
      } else if (oldNode.level === state.maxLevel) {
        commit("updateMaxLevel")
      }
      await dispatch("updateLinkDirections", id)
    }

    return id
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function updateLinkDirections({ dispatch, getters, state }, id) {
  const level = getters.getNode(id).level
  for (const link of state.links) {
    if (link.source === id) {
      const otherLevel = getters.getNode(link.target).level
      if (level > otherLevel) {
        await dispatch("doReverseLink", { source: link.source, target: link.target })
      }
    } else if (link.target === id) {
      const otherLevel = getters.getNode(link.source).level
      if (level < otherLevel) {
        await dispatch("doReverseLink", { source: link.source, target: link.target })
      }
    }
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

export async function deleteNode({ dispatch }, id) {
  await dispatch("buildCommand", {
    name: "delete node",
    executeAction: "doDeleteNode",
    executePayload: id,
    executeCallback: nodeIdAndLinks => ({
      undoPayload: nodeIdAndLinks,
    }),
    undoAction: "doRestoreNode", // may customize the undo action to recreate the links associated with the node
    undoPayload: { id },
  })
}

export async function doDeleteNode({ commit, dispatch, state, getters }, id) {
  try {
    const level = getters.getNode(id).level

    await client.deleteNode(id)

    // delete all links connected to the node, and remove node from childOrdering of neighbours
    const neighbouringLinks = getters.getNeighbouringLinks(id)
    for (const link of neighbouringLinks) {
      const neighbour = getters.getNode(
        link.source === id ? link.target : link.source
      )
      await dispatch("deleteLink", {
        source: link.source,
        target: link.target,
        useClient: false,
      })
      commit("updateNode", {
        id: neighbour.id,
        newNode: {
          childOrdering: neighbour.childOrdering.filter(childId => childId !== id),
        },
      })
    }

    commit("deleteNode", id)
    if (id === state.rootId) {
      commit("updateRootNode", null)
    }

    if (level === state.maxLevel) {
      commit("updateMaxLevel")
    }

    return {
      id,
      links: neighbouringLinks,
    }
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function doRestoreNode({ commit, dispatch, getters }, payload) {
  try {
    const { node, links } = (
      await client.restoreNode(payload.id, payload.links)
    ).data
    if (node) {
      commit("addNode", Helpers.deepMerge(getters.createDefaultNode(), node))
      if (links) {
        for (const link of links) {
          commit("addLink", link)

          const parent = getters.getNode(link.source)
          commit("updateNode", {
            id: link.source,
            newNode: {
              childOrdering: [...parent.childOrdering, link.target],
            },
          })
        }
      }
    }
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

export async function getTapestryExport({ dispatch }) {
  try {
    return await client.getTapestryExport()
  } catch (error) {
    dispatch("addApiError", error)
  }
}

export async function getTapestryExportAsZip({ dispatch }) {
  try {
    return await client.getTapestryExportAsZip()
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

// links
export async function addLink({ dispatch }, payload) {
  await dispatch("buildCommand", {
    name: "add link",
    executeAction: "doAddLink",
    undoAction: "doDeleteLink",
    executePayload: payload,
  })
}

export async function doAddLink({ commit, dispatch, getters }, newLink) {
  try {
    const sourceLevel = getters.getNode(newLink.source).level
    const targetLevel = getters.getNode(newLink.target).level
    if (sourceLevel > targetLevel) {
      newLink = { ...newLink, source: newLink.target, target: newLink.source }
    }

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

export async function reverseLink({ dispatch }, payload) {
  await dispatch("buildCommand", {
    name: "reverse link",
    executeAction: "doReverseLink",
    executePayload: payload,
    undoPayload: {
      source: payload.target,
      target: payload.source,
    },
  })
}

export async function doReverseLink({ commit, dispatch, getters }, link) {
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
  { dispatch },
  { source, target, useClient = true }
) {
  if (useClient) {
    await dispatch("buildCommand", {
      name: "delete link",
      executeAction: "doDeleteLink",
      executePayload: { source, target, useClient },
      undoAction: "doAddLink",
      undoPayload: { source, target },
    })
  } else {
    await dispatch("doDeleteLink", { source, target, useClient })
  }
}

export async function doDeleteLink(
  { commit, dispatch, getters },
  { source, target, useClient = true }
) {
  try {
    if (useClient) await client.deleteLink({ source: source, target: target })

    const parent = getters.getNode(source)
    commit("updateNode", {
      id: source,
      newNode: {
        childOrdering: parent.childOrdering.filter(id => id !== target),
      },
    })

    commit("deleteLink", { source, target })
  } catch (error) {
    dispatch("addApiError", error)
  }
}

// favourites
export async function toggleFavourite({ dispatch }, payload) {
  await dispatch("buildCommand", {
    name: "toggle favourite",
    executeAction: "doToggleFavourite",
    executePayload: payload,
  })
}

export function doToggleFavourite({ dispatch, getters }, id) {
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

export function resetNodeNavigation({ commit }, nodeId) {
  commit("setNodeNavigation", {
    stack: [nodeId],
    siblings: [],
    siblingPosition: -1,
    linkMode: false,
  })
}

export function goToNodeChildren({ commit, state, getters }) {
  if (state.nodeNavigation.stack.length > 0) {
    const nodeId = state.nodeNavigation.stack[state.nodeNavigation.stack.length - 1]
    const childrenIds = getters.getDirectChildren(nodeId)
    if (childrenIds.length > 0) {
      commit("setNodeNavigation", {
        stack: [...state.nodeNavigation.stack, childrenIds[0]],
        siblings: childrenIds,
        siblingPosition: 0,
      })
      return childrenIds[0]
    }
  }
  return false
}

export function goToNodeParent({ commit, dispatch, state, getters }) {
  const len = state.nodeNavigation.stack.length
  if (len >= 2) {
    const parentId = state.nodeNavigation.stack[len - 2]
    const newStack = state.nodeNavigation.stack.slice(0, len - 1)
    if (len >= 3) {
      const grandParentId = state.nodeNavigation.stack[len - 3]
      const parentSiblings = getters.getDirectChildren(grandParentId)
      commit("setNodeNavigation", {
        stack: newStack,
        siblings: parentSiblings,
        siblingPosition: parentSiblings.indexOf(parentId),
      })
    } else {
      dispatch("resetNodeNavigation", parentId)
    }
    return parentId
  }
  return false
}

export function goToNodeSibling({ commit, state }, offset) {
  let newPosition = state.nodeNavigation.siblingPosition + offset
  if (newPosition < 0) {
    newPosition = state.nodeNavigation.siblings.length - 1
  } else if (newPosition >= state.nodeNavigation.siblings.length) {
    newPosition = 0
  }
  const nodeId = state.nodeNavigation.siblings[newPosition]
  commit("setNodeNavigation", {
    ...state.nodeNavigation,
    stack: [
      ...state.nodeNavigation.stack.slice(0, state.nodeNavigation.stack.length - 1),
      nodeId,
    ],
    siblingPosition: newPosition,
  })
  return nodeId
}

export async function updateNotifications({ commit, dispatch }, notifications) {
  try {
    await client.updateNotifications(notifications)
    commit("setNotifications", notifications)
  } catch (error) {
    dispatch("addApiError", error)
  }
}
