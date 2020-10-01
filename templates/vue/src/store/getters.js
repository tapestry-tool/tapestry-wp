import { tydeTypes } from "@/utils/constants"
import Helpers from "@/utils/Helpers"

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

export function isAccordion(_, { getNode, getParent }) {
  return id => {
    const node = getNode(id)

    // Check 1: Node itself is an accordion
    if (node.mediaType === "accordion") {
      return true
    }

    // Check 2: Node is a subaccordion
    const parent = getParent(node.id)
    if (parent) {
      const parentNode = getNode(parent)
      return parentNode.mediaType === "accordion"
    }

    return false
  }
}

export function isAccordionRow(_, { getParent, isAccordion }) {
  return (id, accordion) => {
    const parent = getParent(id)
    if (!parent) {
      return false
    }
    if (accordion !== undefined) {
      return parent === accordion
    }
    return isAccordion(parent)
  }
}

export function isVisible(_, { getNode, isAccordionRow }) {
  return id => {
    const node = getNode(id)
    if (node.nodeType === "") {
      return false
    }
    if (!Helpers.hasPermission(node, "edit")) {
      return !isAccordionRow(node.id)
    }
    return true
  }
}

export function getActivities(state) {
  return (options = {}) => {
    const { exclude = [] } = options
    return state.nodes
      .filter(node => !exclude.includes(node.id) && Boolean(node.quiz))
      .flatMap(node => node.quiz)
  }
}

export function getQuestion(state) {
  return id => {
    const node = state.nodes
      .filter(node => node.quiz)
      .find(node => node.quiz.find(q => q.id == id))
    if (node) {
      return node.quiz.find(q => q.id == id)
    }
    return null
  }
}

export function getEntry(_, { getQuestion }) {
  return (questionId, answerType) => {
    const question = getQuestion(questionId)
    if (!question) {
      return null
    }
    const entry = question.entries[answerType]
    if (!entry) {
      return null
    }
    /* If the answer is an audio, then entry is the audio file in base64. */
    if (answerType === "audioId") {
      return { type: "audio", entry: "data:audio/ogg; codecs=opus;base64," + entry }
    }
    const answers = getAnswersFromEntry(entry)
    return formatEntry(answers, answerType)
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

export function favourites(state) {
  return state.favourites || []
}

export function isFavourite(_, { favourites }) {
  return id => favourites.findIndex(fid => fid == id) > -1
}

/* An answer is a value where its key is numeric */
function getAnswersFromEntry(entry) {
  return Object.entries(entry)
    .filter(obj => !isNaN(parseInt(obj[0], 10)))
    .map(i => i[1])
}

function formatEntry(answers, answerType) {
  if (answerType === "textId") {
    return {
      type: "text",
      entry: answers[0],
    }
  }
  if (answerType === "checklistId") {
    return { type: "checklist", entry: answers.filter(answer => answer !== "") }
  }
}

export function tapestryJson(state) {
  const exportedTapestry = {
    nodes: Object.values(state.nodes).map(node => {
      const newNode = { ...node }
      if (newNode.quiz) {
        newNode.quiz = newNode.quiz.map(question => {
          return { ...question, completed: false, entries: null }
        })
      }
      return newNode
    }),
    links: state.links.map(link => ({
      ...link,
      source: link.source.id,
      target: link.target.id,
    })),
    groups: state.groups,
  }
  return exportedTapestry
}

export function xOrFx({ settings }) {
  return settings.autoLayout ? "x" : "fx"
}

export function yOrFy({ settings }) {
  return settings.autoLayout ? "y" : "fy"
}

export function createDefaultNode({ settings }) {
  return () => ({
    type: "tapestry_node",
    description: "",
    conditions: [],
    behaviour: "new-window",
    status: "publish",
    nodeType: "child",
    title: "",
    imageURL: "",
    lockedImageURL: "",
    mediaType: "text",
    mediaFormat: "",
    mediaDuration: 0,
    typeId: 1,
    group: 1,
    progress: 0,
    permissions: settings.defaultPermissions || {
      public: ["read"],
      authenticated: ["read"],
    },
    typeData: {
      linkMetadata: null,
      mediaURL: "",
      mediaWidth: 960, //TODO: This needs to be flexible with H5P
      mediaHeight: 600,
      subAccordionText: "More content:",
      planetViewNotEarnedIconUrl: "",
      planetViewEarnedIconUrl: "",
      spaceshipPartNotEarnedIconUrl: "",
      spaceshipPartEarnedIconUrl: "",
      spaceshipPartHoverIconUrl: "",
      spaceshipPartX: 0,
      spaceshipPartY: 0,
      spaceshipPartWidth: 0,
      spaceshipPartHeight: 0,
    },
    hideTitle: false,
    hideProgress: false,
    hideMedia: false,
    skippable: true,
    fullscreen: false,
    tydeType: "Regular",
    coordinates: {
      x: 3000,
      y: 3000,
    },
    childOrdering: [],
    quiz: [],
    license: "",
    references: "",
    unlocked: true,
    accessible: true,
  })
}

// TYDE ONLY

export function getModuleFavourites(_, { isFavourite, getNode, getDirectChildren }) {
  return moduleId => {
    const favourites = []
    if (isFavourite(moduleId)) {
      favourites.push(moduleId)
    }
    const stages = getDirectChildren(moduleId)
    stages.forEach(stageId => {
      const stage = getNode(stageId)
      const grouping = {
        title: stage.title,
      }
      const favouritesInStage = []
      if (isFavourite(stageId)) {
        favouritesInStage.push(stageId)
      }
      const topics = getDirectChildren(stageId).map(getNode)
      const accordionRows = topics
        .filter(topic => topic.mediaType === "accordion")
        .flatMap(topic => getDirectChildren(topic.id).map(getNode))
      const subAccordionRows = accordionRows
        .filter(row => getDirectChildren(row.id).length > 0)
        .flatMap(row => getDirectChildren(row).map(getNode))
      const allTopics = [...topics, ...accordionRows, ...subAccordionRows]
      allTopics
        .filter(topic => isFavourite(topic.id))
        .forEach(topic => favouritesInStage.push(topic.id))
      grouping.rows = favouritesInStage
      if (favouritesInStage.length) {
        favourites.push(grouping)
      }
    })
    return favourites
  }
}

export function getModuleContent(_, { getNode, getDirectChildren }) {
  return moduleId => {
    const module = getNode(moduleId)
    const isCopilot = module.userType === "teen"
    return getDirectChildren(moduleId).map(stageId => ({
      node: getNode(stageId),
      topics: getDirectChildren(stageId)
        .map(getNode)
        .filter(content => isCopilot || content.completed),
    }))
  }
}

export function getModuleActivities(_, { getNode, getDirectChildren }) {
  return moduleId => {
    const topics = getDirectChildren(moduleId).flatMap(getDirectChildren)
    return topics.flatMap(id => {
      const topic = getNode(id)
      if (topic.mediaType === "accordion") {
        // look at the rows for questions
        const rows = getDirectChildren(topic.id).map(getNode)
        const rowActivities = rows
          .filter(row => row.quiz)
          .flatMap(getCompletedActivities)
        const subRows = rows
          .map(row => getDirectChildren(row.id))
          .filter(child => child.length > 0)
          .map(getNode)
        const subRowActivities = subRows
          .filter(row => row.quiz)
          .flatMap(getCompletedActivities)
        return rowActivities.concat(subRowActivities)
      }
      if (topic.quiz) {
        return getCompletedActivities(topic)
      }
      return []
    })
  }
}

function getCompletedActivities(node) {
  return node.quiz
    .filter(activity => activity.completed)
    .map(activity => ({ ...activity, userType: node.userType }))
}

export function getProfileActivities({ nodes, settings }) {
  let activities = []
  let nodesWithQuestions = Object.values(nodes).filter(
    node =>
      node.quiz &&
      node.quiz.some(
        question => question.entries && Object.keys(question.entries).length > 0
      )
  )
  nodesWithQuestions.forEach(node => {
    node.quiz
      .filter(
        question =>
          question.entries &&
          settings.profileActivities.find(item =>
            node.quiz.find(question => item.activityRef === question.id)
          )
      )
      .forEach(question => {
        activities.push(question)
      })
  })

  // Go through profile activities in settings and add related answers if there
  // Profile activites may have repeat activities and have a specific sort order
  let profileActivities = []
  for (let profileQuestion of settings.profileActivities) {
    for (let questionWithAnswer of activities) {
      if (questionWithAnswer.id === profileQuestion.activityRef) {
        profileActivities.push(questionWithAnswer)
        break
      }
    }
  }
  return profileActivities
}

export function getNeighbours(state) {
  return id => {
    return state.links
      .filter(link => link.source == id || link.target == id)
      .map(link => (link.source == id ? link.target : link.source))
  }
}

export function getTydeProgress(_, { getNode, getDirectChildren }) {
  return id => {
    const node = getNode(id)
    if (node.tydeType !== tydeTypes.MODULE && node.tydeType !== tydeTypes.STAGE) {
      return 0
    }

    let topics = []
    if (node.tydeType === tydeTypes.MODULE) {
      const stages = getDirectChildren(id)
      topics = stages.flatMap(getDirectChildren).map(getNode)
    } else {
      topics = getDirectChildren(id).map(getNode)
    }

    if (!topics.length) {
      return 1
    }

    const completedTopics = topics.filter(topic => topic.completed)
    return completedTopics.length / topics.length
  }
}
