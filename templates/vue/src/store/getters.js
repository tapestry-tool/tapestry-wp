import { nodeStatus, userActions } from "@/utils/constants"
import Helpers from "@/utils/Helpers"
import * as wp from "../services/wp"

export function isEmptyTapestry(state) {
  return Object.keys(state.nodes).length === 0
}

export function getInitialNodeId(state) {
  if (state.rootId) {
    return state.rootId
  }
  const nodeIds = Object.keys(state.nodes)
  return nodeIds.length === 0 ? null : parseInt(nodeIds[0])
}

export function getDirectChildren(state) {
  return id => {
    const links = state.links
    return links.filter(link => link.source == id).map(link => link.target)
  }
}

export function getDirectParents(state) {
  return id => {
    return state.links.filter(link => link.target == id).map(link => link.source)
  }
}

export function getNode(state) {
  return id => state.nodes[id]
}

export function getParent(state) {
  return id => {
    const link = state.links.find(l => l.target == id || l.target.id == id)
    return link ? link.source : null
  }
}

export function isMultiContent(_, { getNode, isNestedMultiContent }) {
  return id => {
    const node = getNode(id)
    return node.mediaType === "multi-content" || isNestedMultiContent(id)
  }
}

export function isNestedMultiContent(_, { getNode, getParent }) {
  return id => {
    const parent = getParent(id)
    if (parent) {
      const parentNode = getNode(parent)
      return parentNode.mediaType === "multi-content"
    }
    return false
  }
}

export function isMultiContentRow(_, { getParent, isMultiContent }) {
  return (id, multiContent) => {
    const parent = getParent(id)
    if (!parent) {
      return false
    }
    if (multiContent !== undefined) {
      return parent === multiContent
    }
    return isMultiContent(parent)
  }
}

export function hasMultiContentAncestor(_, { getParent, isNestedMultiContent }) {
  return id => {
    const visited = new Set()
    let nodeId = id
    while (nodeId) {
      visited.add(nodeId)

      let parent = getParent(nodeId)
      if (!parent) return false
      if (isNestedMultiContent(nodeId)) return true

      if (visited.has(parent)) {
        break
      }

      nodeId = parent
    }
    return false
  }
}

export function isVisible(_, { getNode, hasMultiContentAncestor, hasPermission }) {
  return id => {
    const node = getNode(id)
    if (!hasPermission(node, "read")) {
      return false
    }
    if (!hasPermission(node, "edit") && !wp.canEditTapestry()) {
      return (
        (node.unlocked || !node.hideWhenLocked) && !hasMultiContentAncestor(node.id)
      )
    }
    return true
  }
}

export function getQuestion(state) {
  return id => {
    const node = Object.values(state.nodes)
      .filter(node => node.typeData.activity)
      .find(node => node.typeData.activity.questions.find(q => q.id == id))
    if (node) {
      return node.typeData.activity.questions.find(q => q.id == id)
    }
    return null
  }
}

export function getAnswers(state) {
  return (nodeId, questionId) => {
    if (state?.userAnswers?.[nodeId]?.activity?.[questionId]?.answers) {
      return state.userAnswers[nodeId].activity[questionId].answers
    } else {
      return {}
    }
  }
}

export function hasPath(state) {
  return (from, to, options = {}) => {
    const { exclude = [] } = options
    const allowedLinks = state.links.filter(link => {
      return (
        exclude.find(
          blacklistedLink =>
            blacklistedLink.source === link.source &&
            blacklistedLink.target === link.target
        ) !== undefined
      )
    })

    const stack = []
    const visited = new Set()

    stack.push(from)
    visited.add(from)
    while (stack.length > 0) {
      const node = stack.pop()
      if (node === to) {
        return true
      }

      const neighbours = allowedLinks
        .filter(link => link.source == node || link.target == node)
        .map(link => (link.source == node ? link.target : link.source))
      for (const neighbour of neighbours) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour)
          stack.push(neighbour)
        }
      }
    }
    return false
  }
}

export function isAuthoringEnabled(state, { hasPermission }) {
  if (!wp.isLoggedIn()) {
    return false
  }
  if (state.settings.draftNodesEnabled) {
    return true
  }
  for (const id in state.nodes) {
    if (
      hasPermission(state.nodes[id], "edit") ||
      hasPermission(state.nodes[id], "add")
    ) {
      return true
    }
  }
  return false
}

export function hasPermission({ settings }) {
  return (node, action) => {
    // Check 0: node is null case - this should only apply to creating a standalone node
    if (node === null) {
      if (action !== userActions.ADD) {
        return false
      }
      if (wp.canEditTapestry()) {
        return true
      }
      return Helpers.isActionAllowed(settings.defaultPermissions, action)
    }

    // Public users never have any permissions other than read
    if (action !== userActions.READ && !wp.isLoggedIn()) {
      return false
    }

    // Checks related to draft nodes
    /**
     * If node is a draft (accepted draft nodes are PUBLISHED nodes, so they are not considered here):
     * - If node is not submitted for review:
     *  - Allow all actions except "add" for original author
     *  - Allow all actions except "edit" for reviewer if node is rejected and showRejected is true
     * - If node is submitted for review:
     *  - Only allow "read" for original author
     *  - Allow all actions except "edit" for reviewer
     */
    if (node.status === nodeStatus.DRAFT) {
      if (node.author && wp.isCurrentUser(node.author.id)) {
        if (action === userActions.READ || wp.canEditTapestry()) {
          return true
        }
        return node.reviewStatus !== nodeStatus.SUBMIT && action !== userActions.ADD
      }
      if (wp.canEditTapestry()) {
        if (action === userActions.EDIT) {
          return false
        }
        return (
          node.reviewStatus === nodeStatus.SUBMIT ||
          (settings.showRejected && node.reviewStatus === nodeStatus.REJECT)
        )
      }
      return false
    }

    // Check 1: User has edit permissions for Tapestry
    if (wp.canEditTapestry()) {
      return true
    }

    // Check 2: User is the author of the node (unless node was submitted, then accepted)
    if (node.author && wp.isCurrentUser(node.author.id)) {
      if (node.reviewStatus !== nodeStatus.ACCEPT) {
        return true
      }
    }

    // Check 3: Node permissions allow user to perform action
    return Helpers.isActionAllowed(node.permissions, action)
  }
}

export function favourites(state) {
  return state.favourites || []
}

export function isFavourite(_, { favourites }) {
  return id => favourites.findIndex(fid => fid == id) > -1
}

export function xOrFx({ settings }) {
  return settings.autoLayout ? "x" : "fx"
}

export function yOrFy({ settings }) {
  return settings.autoLayout ? "y" : "fy"
}

export function createDefaultNode({ settings }) {
  return () => Helpers.createDefaultNode({ settings })
}

export function tapestryJson(state) {
  const exportedTapestry = {
    nodes: Object.values(state.nodes).map(node => {
      const newNode = { ...node }
      return newNode
    }),
    links: state.links,
    groups: state.groups,
  }
  return exportedTapestry
}

export function getNeighbours(state) {
  return id => {
    return state.links
      .filter(link => link.source == id || link.target == id)
      .map(link => (link.source == id ? link.target : link.source))
  }
}

export function getNeighbouringLinks(state) {
  return id => {
    return state.links.filter(link => link.source == id || link.target == id)
  }
}

export function getTheme(state) {
  return state.theme ? state.theme : "light"
}

export function getNodeNavId(state) {
  return state.nodeNavigation.stack.length === 0
    ? -1
    : state.nodeNavigation.stack[state.nodeNavigation.stack.length - 1]
}

export function getNodeNavParent(state) {
  return state.nodeNavigation.stack.length < 2
    ? -1
    : state.nodeNavigation.stack[state.nodeNavigation.stack.length - 2]
}

export function getNodeNavIsLinkMode(state) {
  return state.nodeNavigation.linkMode
}

export function canUndo(state) {
  return state.commandHistory.position >= 0
}

export function canRedo(state) {
  return state.commandHistory.position < state.commandHistory.history.length - 1
}

export function getNodeDimensions(state, { isVisible }) {
  const box = {
    x0: 30000,
    y0: 30000,
    x: 0,
    y: 0,
  }
  for (const node of Object.values(state.nodes)) {
    if (node.nodeType !== "" && isVisible(node.id)) {
      const { x, y } = node.coordinates
      box.x0 = Math.min(x, box.x0)
      box.y0 = Math.min(y, box.y0)
      box.x = Math.max(x, box.x)
      box.y = Math.max(y, box.y)
    }
  }

  return box
}
